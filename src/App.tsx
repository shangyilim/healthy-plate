import { useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { CameraCaptureModal } from './components/CameraCaptureModal'
import { FirebaseLoginUI } from './components/FirebaseLoginUI'
import { Box, styled } from '@mui/material'

import { FieldValue, addDoc, collection, doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { useFirebaseUser } from './hooks'
import { FileUploadModal } from './components/FileUploadModal'
import { PlateAnalysisList } from './components/PlateAnalysisList'

const db = getFirestore();

function App() {

  const user = useFirebaseUser();




  const handlePhotoTaken = async (photoPath: string) => {
    
    if(!user) {
      return;
    }
    
    await addDoc(collection(db, `analysis/${user.uid}/items`), {
      imagePath: photoPath,
      uid: user.uid,
      timestamp: serverTimestamp()
    });
  }
  

  return (
    <>

      <FirebaseLoginUI className="firLoginUi" />
      
      <h1>🍽️  Healthy Plate Checker 🍽️</h1>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',flexGrow: 1 }}>
        {/* <CameraCaptureModal
          onPhotoTaken={handlePhotoTaken} /> */}
        <FileUploadModal onPhotoTaken={handlePhotoTaken}/>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',flexGrow: 1 }}>

      </Box>
    
      <PlateAnalysisList />
    </>
  )
}


export default App
