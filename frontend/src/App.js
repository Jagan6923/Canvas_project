import React, { useState } from 'react';
import CanvasForm from './components/CanvasForm';
import ElementForm from './components/ElementForm';
import axios from 'axios';
import './App.css'; // Ensure CSS is imported

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [exportMessage, setExportMessage] = useState('');
  const [isExportError, setIsExportError] = useState(false);

  const handleExport = async () => {
    try {
      setExportMessage('Exporting PDF...');
      setIsExportError(false);

      const response = await axios.get(`${API_URL}/api/canvas/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'canvas.pdf');
      document.body.appendChild(link);
      link.click();

      setExportMessage('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportMessage('Failed to export PDF. Check console for details.');
      setIsExportError(true);
    }
  };

  return (
    <div className="app-container">
      <h1>Canvas Builder</h1>
      <div style={{ marginBottom: '32px' }}>
        <CanvasForm setCanvasSize={setCanvasSize} />
      </div>
      <div style={{ marginBottom: '32px', borderTop: '1px solid #eee', paddingTop: '32px' }}>
        <ElementForm />
      </div>
      <div style={{ textAlign: 'center' }}>
        <button onClick={handleExport}>Export PDF</button>
        {exportMessage && (
          <div className="message-container" style={{ marginTop: '10px' }}>
            <span style={{ color: isExportError ? 'red' : 'green' }}>{exportMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
