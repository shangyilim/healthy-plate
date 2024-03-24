import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getStorage, ref, uploadBytes } from "firebase/storage";
const storage = getStorage();


interface Props {
  onPhotoTaken: (photoRef: string, type:string) => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
export const FileUploadModal: FC<Props> = ({ onPhotoTaken }) => {

  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const [cameraState, setCamerastate] = useState<string>('capture');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string|null>(null);


  const uploadPhoto = () => {
    uploadFileInputRef.current?.click();
  }

  const handleFileInputChange = () => {
    const file = uploadFileInputRef.current?.files?.[0];

    if(!file){
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if(!e.target?.result){
        return;
      }
      setPreviewImage(e.target.result as string);
    };
    reader.readAsDataURL(file);
    setCamerastate('preview');
    setModalOpen(true);
  }

  const handleClose = () => {
    setModalOpen(false);
  }

  const cancelTakePicture = () => {
    setCamerastate('capture');
    setModalOpen(false);
    setPreviewImage(null);
  }

  const analyze = () => {

    const file = uploadFileInputRef.current?.files?.[0];

    if(!file){
      return;
    }

    const timestamp = (new Date()).getTime().toString();
    const storageRef = ref(storage, `${timestamp}_${file.name}`);
    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, file).then((snapshot) => {
      setModalOpen(false); 
      onPhotoTaken(snapshot.ref.toString(), file.type);
    });
  }

  return <>
    <button onClick={uploadPhoto}>🖼️ Gallery</button>
    <input ref={uploadFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={modalOpen}

    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Upload File
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {previewImage && (
          <img style={{width: '100%'}} src={previewImage} alt="Preview" />
        )}
      </DialogContent>
      <DialogActions>

        {cameraState === 'preview' && <>
          <Button variant='outlined' onClick={cancelTakePicture}>
            Cancel
          </Button>
          <Button variant='contained' autoFocus onClick={analyze}>
            Analyze
          </Button>
        </>}
      </DialogActions>
    </BootstrapDialog>
  </>;
};
