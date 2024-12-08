import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import { getUserById } from '../firestoreService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isResponder, setIsResponder] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [typeAdmin, setTypeAdmin] = useState('');
  const [isDuty, setDuty] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth) {
        const setupUserListener = async () => {
          try {
            const userData = await getUserById(userAuth.uid);
            const isOnDuty = userData?.on_duty === true;

            // Update user states
            setUser({ ...userAuth, ...userData });
            setIsResponder(userData?.type === 'responder');
            setIsAdmin(userData?.type === 'admin');
            setTypeAdmin(userData.admin_type);
            setDuty(isOnDuty);

            // Set up Firestore listener for real-time updates
            const userDocRef = doc(db, 'users', userAuth.uid);
            const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const updatedData = docSnap.data();

                setUser((prevUser) => ({
                  ...prevUser,
                  ...updatedData,
                }));

                setIsResponder(updatedData?.type === 'responder');
                setIsAdmin(updatedData?.type === 'admin');
                setTypeAdmin(updatedData?.admin_type)
                setDuty(updatedData?.on_duty === true);
              }
            });

            // Clean up Firestore listener when auth changes
            return () => unsubscribeFirestore();
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };

        setupUserListener();
      } else {
        // Clear user state on sign-out
        setUser(null);
        setIsResponder(false);
        setIsAdmin(false);
        setDuty(false);
      }
    });

    // Clean up Auth listener
    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, isResponder, isDuty, isAdmin, typeAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;