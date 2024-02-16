import React, { useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://7902-34-148-231-189.ngrok-free.app/predict',
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100vh',
        width:"100vw",
        backgroundColor: '#282c34',
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
      />

      <label htmlFor="contained-button-file">
        <IconButton color="primary" aria-label="upload picture" component="span">
          <PhotoCamera sx={{ fontSize: 30 }} />
        </IconButton>
      </label>

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
    </Box>
  );
};

export default App;
