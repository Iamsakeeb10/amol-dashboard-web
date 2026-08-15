import { collection, doc, getDocs, setDoc, updateDoc, increment, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Papa from 'papaparse';

export async function fetchTopics() {
  const querySnapshot = await getDocs(collection(db, "topics"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

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
