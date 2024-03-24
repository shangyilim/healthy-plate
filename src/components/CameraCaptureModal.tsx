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
  onPhotoTaken: (photoRef: string) => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function drawCanvas(viewfinder: HTMLVideoElement, container: HTMLDivElement, img: ImageBitmap) {

  const canvas = document.createElement('canvas');
  canvas.width = parseFloat(getComputedStyle(viewfinder).width.split('px')[0]);
  canvas.height = parseFloat(getComputedStyle(viewfinder).height.split('px')[0]);
  let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d')?.drawImage(img, 0, 0, img.width, img.height,
    x, y, img.width * ratio, img.height * ratio);

  container.appendChild(canvas);
}

export const CameraCaptureModal: FC<Props> = ({ onPhotoTaken }) => {


  const viewfinderRef = useRef<HTMLVideoElement>(null);
  const imageCaptureRef = useRef<any>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false)

  const [cameraState, setCameraState] = useState<string>('capture');

  const handleClose = async () => {
    setCameraModalOpen(false);
  }


  const beginTakePhoto = () => {
    setCameraModalOpen(true);
    setCameraState('capture');
    startViewFinder();
  }

  const capturePicture = async () => {
    if (!imageCaptureRef.current || !canvasContainerRef.current || !viewfinderRef.current) {
      return;
    }

    const blob = await imageCaptureRef.current.takePhoto();
    const imageBitmap = await createImageBitmap(blob);


    blobRef.current = blob;
    drawCanvas(viewfinderRef.current, canvasContainerRef.current, imageBitmap);
    setCameraState('preview');

  }

  const cancelTakePicture = () =>{
    if(!canvasContainerRef.current?.firstChild){
      return;
    }
    canvasContainerRef.current?.removeChild(canvasContainerRef.current.firstChild);
    startViewFinder();
  }

  const startViewFinder = useCallback(async () => {
    try {



      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });


      const track = mediaStream.getVideoTracks()[0];
      imageCaptureRef.current = new ImageCapture(track);

      if (!viewfinderRef.current) {
        return;
      }
      viewfinderRef.current.srcObject = mediaStream;
      // Use the imageData to display the photo
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }, []);

  const analyze = () => {

    if(!blobRef.current){
      return;
    }

    const timestamp = (new Date()).getTime().toString();
    const storageRef = ref(storage, `${timestamp}.jpg`);
    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, blobRef.current).then((snapshot) => {
      onPhotoTaken(snapshot.ref.toString());
    
    });
  }

  useEffect(() => {
    if (cameraModalOpen) {
      startViewFinder();
    }
  }, [cameraModalOpen, startViewFinder])


  return <div>
    <button onClick={beginTakePhoto}>📷 Camera</button>
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={cameraModalOpen}

    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Camera
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
        {cameraState === 'capture' && <video id='viewfinder' ref={viewfinderRef} autoPlay></video>}
        <div ref={canvasContainerRef}>

        </div>
      </DialogContent>
      <DialogActions>
        {cameraState === 'capture' && <Button variant='contained' autoFocus onClick={capturePicture}>
          Capture
        </Button>}
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
  </div>;
};
