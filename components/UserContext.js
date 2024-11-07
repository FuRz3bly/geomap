import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import { getUserById } from '../firestoreService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isResponder, setIsResponder] = useState(false);
  const [isDuty, setDuty] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribeAuth = onAuthStateChanged(auth, async (userAuth) => {
        if (userAuth) {
            try {
                const userData = await getUserById(userAuth.uid);
                setUser({ ...userAuth, ...userData });

                setIsResponder(userData.type === 'responder');

                // Check if the user is on duty
                const isOnDuty = userData.on_duty === true; // Adjust based on the actual field name in Firestore
                setDuty(isOnDuty); // Assuming you have a state variable set up for on duty status

                // Set up Firestore listener for real-time updates
                const userDocRef = doc(db, 'users', userAuth.uid); // Adjust the path as needed
                const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const updatedData = doc.data(); // Retrieve document data safely

                        if (updatedData) { // Ensure updatedData is not undefined
                            setUser((prevUser) => ({
                                ...prevUser,
                                ...updatedData,
                            }));
                            setIsResponder(updatedData.type === 'responder');

                            // Check if the updated user is on duty
                            const isOnDuty = updatedData.on_duty === true; // Adjust based on the actual field name
                            setDuty(isOnDuty); // Update state with the current on duty status
                        } else {
                            console.log("Document exists but has no data!");
                        }
                    } else {
                        console.log("No such document!");
                    }
                });

                // Clean up Firestore listener
                return () => unsubscribeFirestore();
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        } else {
            setUser(null);
        }
    });

    // Clean up Auth listener
    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{user, isResponder, isDuty}}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;