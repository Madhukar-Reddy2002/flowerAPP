import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
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
        "https://426a-103-246-171-254.ngrok-free.app/predict",
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

    // Access the device camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  };

  const handleCaptureSnapshot = () => {
    const videoElement = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const snapshot = canvas.toDataURL('image/jpeg');
    
    setPreviewUrl(snapshot);
    setSelectedFile(null);

    // Stop the video stream
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
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
        overflow: 'hidden',
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleCaptureSnapshot}
        style={{ marginTop: '20px' }}
      >
        Capture Photo
      </Button>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected"
          style={{
            marginTop: '20px',
            width: '300px', // Fixed width
            height: '300px', // Fixed height
            objectFit: 'cover', // Ensure the image covers the container
            borderRadius: '8px',
          }}
        />
      )}

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

      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
      ></video>
    </Box>
  );
};

export default App;