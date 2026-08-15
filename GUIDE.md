# Building the Knowledge Battle Admin Dashboard

This guide outlines exactly how to build a Next.js web dashboard to manage and upload questions to your Firestore database for the Knowledge Battle feature. 

Since you only need to type in one language (either Bengali or English) and don't want separate localized inputs, the dashboard will simply map your input to both the `En` and `Bn` fields in the database to ensure the mobile app renders them seamlessly regardless of the user's selected language.

## 1. Tech Stack Overview
*   **Framework**: Next.js 14+ (App Router)
*   **Styling**: Tailwind CSS & shadcn/ui (for fast, beautiful form components, tables, and toast notifications)
*   **Database**: Firebase Web SDK (`firebase/firestore`)
*   **File Parsing**: `papaparse` (for bulk CSV upload)
*   **Deployment**: Vercel

## 2. Project Setup
Run the following commands to bootstrap the project:

```bash
npx create-next-app@latest battle-admin-dashboard
cd battle-admin-dashboard
npm install firebase papaparse react-dropzone
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input select card toast table
```

## 3. Firebase Configuration
Create a file at `src/lib/firebase.js`. You will need to get your config from the Firebase Console (Project Settings > General > Web Apps).

```javascript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
```
*(Make sure to add these variables to your `.env.local` file).*

## 4. Database Schema Mapping
Based on your Flutter app, a question document in `/topics/{topicId}/questions/{questionId}` looks like this:

```json
{
  "id": "q_123",
  "topicId": "topic_abc",
  "text": "Question text...",
  "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
  "correctIndex": 0,
  "difficulty": "easy",
  "isActive": true
}
```

Since the backend and app have been updated to use a single field for questions, the dashboard will simply take a single `text` and `options` array from the user.

## 5. Core Application Logic

### Fetching Topics
To add a question, you first need to select a topic. Create a hook or service to fetch active topics.

```javascript
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function fetchTopics() {
  const querySnapshot = await getDocs(collection(db, "topics"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Adding a Single Question
```javascript
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function addQuestion(topicId, questionData) {
  // 1. Generate a new ID
  const newQuestionRef = doc(collection(db, `topics/${topicId}/questions`));
  
  // 2. Build payload with single fields
  const payload = {
    id: newQuestionRef.id,
    topicId: topicId,
    text: questionData.text,
    options: questionData.options,
    correctIndex: parseInt(questionData.correctIndex),
    difficulty: questionData.difficulty || 'easy',
    isActive: true
  };

  // 3. Write to DB
  await setDoc(newQuestionRef, payload);

  // 4. Update the questionCount on the Topic document
  const topicRef = doc(db, "topics", topicId);
  await updateDoc(topicRef, {
    questionCount: increment(1)
  });
}
```

### Bulk Uploading via CSV
For bulk uploads, users should upload a CSV with columns: `Question, Option1, Option2, Option3, Option4, CorrectIndex (0-3), Difficulty`.

```javascript
import Papa from 'papaparse';
import { writeBatch } from "firebase/firestore";

export async function processBulkUpload(file, topicId) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function(results) {
        try {
          const batch = writeBatch(db);
          let count = 0;

          results.data.forEach(row => {
            const newRef = doc(collection(db, `topics/${topicId}/questions`));
            batch.set(newRef, {
              id: newRef.id,
              topicId: topicId,
              text: row.Question,
              options: [row.Option1, row.Option2, row.Option3, row.Option4],
              correctIndex: parseInt(row.CorrectIndex),
              difficulty: row.Difficulty || 'easy',
              isActive: true
            });
            count++;
          });

          // Commit batch
          await batch.commit();

          // Update topic count
          const topicRef = doc(db, "topics", topicId);
          await updateDoc(topicRef, { questionCount: increment(count) });

          resolve(count);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
```

## 6. UI Structure (`src/app/page.js`)
Your main page should consist of:
1. **Topic Selector**: A dropdown populated by `fetchTopics()`.
2. **Tabs**: Two tabs to switch between "Single Add" and "Bulk Upload".
3. **Single Form**: Fields for Question Text, 4 Option inputs, a Correct Answer radio group, and a Submit button.
4. **Bulk Dropzone**: A drag-and-drop area for CSV files utilizing `react-dropzone`.

> [!TIP]
> Use `shadcn/ui` Toast component to show a green success message whenever a question or batch is successfully uploaded.

## 7. Deploying to Vercel

Vercel makes deploying Next.js apps incredibly simple.

1. **Push your code to GitHub**: 
   Commit your Next.js project and push it to a new private repository on GitHub.
2. **Connect to Vercel**:
   Go to [vercel.com](https://vercel.com), click **Add New... > Project**, and select your GitHub repository.
3. **Set Environment Variables**:
   Before clicking Deploy, open the **Environment Variables** section and paste all your `NEXT_PUBLIC_FIREBASE_*` variables from your local `.env.local` file.
4. **Deploy**:
   Click Deploy. Vercel will build the Next.js app and provide you with a live URL within minutes.

## 8. Adding Firebase Authentication

To secure the dashboard so only you or your team can access it, you need to add Firebase Authentication.

### 1. Update Firebase Initialization
First, update your `src/lib/firebase.js` file to export the Auth instance:

```javascript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = { /* ... your config ... */ };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 2. Create an Auth Context
Create a React Context to keep track of the logged-in user across the entire app. Create `src/context/AuthContext.js`:

```javascript
'use client';
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Wrap your application in `src/app/layout.js`:
```javascript
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Create a Login Page
Create a new file `src/app/login/page.js`. This will be the public login screen:

```javascript
'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to dashboard on success
    } catch (error) {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="p-8 border rounded-xl shadow-lg flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="border p-2 rounded" />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded font-bold">Login</button>
      </form>
    </div>
  );
}
```

### 4. Protect the Main Dashboard
Update your main `src/app/page.js` to redirect users who aren't logged in:

```javascript
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If there is no user logged in, send them to the login page
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null; // Or a loading spinner

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      
      {/* ... Your Topic Selector, Bulk Upload, and Form ... */}
    </div>
  );
}
```

### Next Steps:
1. Go to your **Firebase Console**.
2. Navigate to **Authentication** > **Sign-in method** and enable **Email/Password**.
3. Go to the **Users** tab and manually create an admin account (e.g. `admin@yourdomain.com`).
4. That's it! Now the dashboard can only be accessed by logging in with the account you just created.
