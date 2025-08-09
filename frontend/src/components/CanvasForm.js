import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CanvasForm = ({ setCanvasSize }) => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/canvas/create`, { width, height });
      setCanvasSize({ width, height });
      setMessage('Canvas successfully initialized!');
      setIsError(false);
    } catch (error) {
      console.error('Error creating canvas:', error);
      setMessage('Failed to initialize canvas. Check console for details.');
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Initialize Canvas</h3>
      <label>Width: </label>
      <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
      <label>Height: </label>
      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
      <button type="submit">Create Canvas</button>
      {message && (
        <div className="message-container" style={{ marginTop: '10px' }}>
          <span style={{ color: isError ? 'red' : 'green' }}>{message}</span>
        </div>
      )}
    </form>
  );
};

export default CanvasForm;
