import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraMode, setCameraMode] = useState('user');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://a10b-103-246-171-254.ngrok-free.app/predict',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setPrediction(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapturePhoto = () => {
    const videoElement = videoRef.current;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: cameraMode } })
      .then((stream) => {
        videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  };

  const dataURLtoFile = (dataURL, fileName) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], fileName, { type: mime });
  };

  const handleCaptureSnapshot = async () => {
    const videoElement = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const snapshot = canvas.toDataURL('image/jpeg');
  
    setPreviewUrl(snapshot);
    setSelectedFile(null);
  
    // Check if srcObject is not null before trying to access tracks
    if (videoElement.srcObject !== null) {
      const stream = videoElement.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  
    videoElement.srcObject = null;
  
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append('file', dataURLtoFile(snapshot, 'captured.jpg'));
  
      const response = await axios.post(
        'https://a10b-103-246-171-254.ngrok-free.app/predict',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      setPrediction(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };  

  const handleCameraModeChange = (event) => {
    setCameraMode(event.target.value);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#282c34',
        overflow: 'auto',
      }}
    >
      <Typography variant="h4" color="white" mb={2}>
        Image Classification
      </Typography>

      <input
        accept="image/*"
        id="contained-button-file"
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />

      <label htmlFor="contained-button-file">
        <IconButton color="primary" aria-label="upload picture" component="span">
          <PhotoCamera sx={{ fontSize: 30 }} />
        </IconButton>
      </label>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCapturePhoto}
        style={{ marginTop: '20px' }}
      >
        Start Camera
      </Button>

      <Select
        value={cameraMode}
        onChange={handleCameraModeChange}
        style={{ marginTop: '10px', color: 'white' }}
      >
        <MenuItem value="user">Front Camera</MenuItem>
        <MenuItem value="environment">Back Camera</MenuItem>
      </Select>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected"
          style={{
            marginTop: '20px',
            width: '300px',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCaptureSnapshot}
        style={{ marginTop: '20px' }}
      >
        Capture Photo
      </Button>

      {loading && <CircularProgress size={24} color="inherit" />}

      {prediction && (
        <div style={{ marginTop: '20px', color: 'white' }}>
          <Typography variant="h6">Prediction:</Typography>
          <Typography variant="body1">Class: {prediction.class}</Typography>
          <Typography variant="body1">
            Confidence: {Math.round(prediction.confidence * 100)}%
          </Typography>
        </div>
      )}

      <video ref={videoRef} autoPlay playsInline muted></video>
    </Box>
  );
};

export default App;
