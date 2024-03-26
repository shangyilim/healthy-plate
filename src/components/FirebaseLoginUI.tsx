import React from 'react';
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'
import Button from '@mui/material/Button';
import { useFirebaseUser } from '../hooks';

const provider = new GoogleAuthProvider();
const auth = getAuth();


interface Props {
  className: string;
}

export const FirebaseLoginUI: React.FC<Props> = ({ className }) => {

  const user = useFirebaseUser();

  const login = () => {
    signInWithRedirect(auth, provider);
  }

  if (user) {
    return (<div className={className}>
      Hi! {user?.displayName}
    </div>)
  }

  return (
    <div className={className}>

      <Button onClick={login}>Login with Google</Button>
    </div>
  );
};
