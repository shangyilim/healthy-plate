import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
const auth = getAuth();

export const useFirebaseUser = () => {
    
  const [user, setUser] = useState<User | null>();


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, [])

    return user;
};
