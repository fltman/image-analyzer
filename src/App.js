import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setLoading(true);
      const formData = new FormData();
      formData.append('image', acceptedFiles[0]);

      try {
        const response = await fetch('http://localhost:3001/analyze-image', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze image');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="App">
      <h1>Image Analyzer</h1>
      
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select one</p>
      </div>

      {loading && <div className="loading">Analyzing image...</div>}

      {analysis && (
        <div className="analysis">
          <h2>Analysis Results</h2>
          <div className="result-card">
            <h3>Keywords</h3>
            <p>{analysis.keywords.join(', ')}</p>
            
            <h3>Rating</h3>
            <p>{analysis.rating}/10</p>
            
            <h3>Description</h3>
            <p>{analysis.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 