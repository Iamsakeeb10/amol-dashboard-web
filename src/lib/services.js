import { collection, doc, getDocs, setDoc, updateDoc, increment, writeBatch, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Papa from 'papaparse';

export async function fetchTopics() {
  const querySnapshot = await getDocs(collection(db, "topics"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createTopic(topicData) {
  const topicId = `topic_${Date.now()}`;
  const newTopicRef = doc(db, "topics", topicId);
  
  const payload = {
    id: topicId,
    name: topicData.name,
    description: topicData.description || "",
    iconName: topicData.iconName || "default_icon",
    isActive: true,
    questionCount: 0
  };

  await setDoc(newTopicRef, payload);
  return payload;
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
    isActive: true,
    sourceType: questionData.sourceType || 'other',
    sourceReference: questionData.sourceReference || ''
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
              isActive: true,
              sourceType: row.SourceType || 'other',
              sourceReference: row.SourceReference || ''
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

export async function editTopic(topicId, updatedData) {
  const topicRef = doc(db, "topics", topicId);
  
  await updateDoc(topicRef, {
    name: updatedData.name,
    description: updatedData.description,
    iconName: updatedData.iconName,
    isActive: updatedData.isActive
  });
}

export async function deleteTopic(topicId) {
  const topicRef = doc(db, "topics", topicId);
  await deleteDoc(topicRef);
}

export async function fetchQuestions(topicId) {
  const querySnapshot = await getDocs(collection(db, `topics/${topicId}/questions`));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function editQuestion(topicId, questionId, updatedData) {
  const questionRef = doc(db, `topics/${topicId}/questions/${questionId}`);
  
  await updateDoc(questionRef, {
    text: updatedData.text,
    options: updatedData.options,
    correctIndex: parseInt(updatedData.correctIndex),
    difficulty: updatedData.difficulty,
    isActive: updatedData.isActive,
    sourceType: updatedData.sourceType || 'other',
    sourceReference: updatedData.sourceReference || ''
  });
}

export async function deleteQuestion(topicId, questionId) {
  // 1. Delete the question document
  const questionRef = doc(db, `topics/${topicId}/questions/${questionId}`);
  await deleteDoc(questionRef);

  // 2. Decrement the questionCount on the Topic document
  const topicRef = doc(db, "topics", topicId);
  await updateDoc(topicRef, {
    questionCount: increment(-1)
  });
}
