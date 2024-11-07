import { collection, query, where, getDocs, getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';

const db = getFirestore(app);
const usersCollection = collection(db, 'users');

export const getUserUP = async (username, password) => {
  try {
    const q = query(usersCollection, where('username', '==', username), where('password', '==', password));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting user: ", e);
    throw new Error("Error getting user");
  }
};

export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting user: ", e);
    throw new Error("Error getting user");
  }
};