import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ElementForm = () => {
  const [type, setType] = useState('rectangle');
  const [data, setData] = useState({
    x: 0, y: 0, width: 100, height: 100, radius: 50,
    text: '', color: 'black', fontSize: 20, imageUrl: '', imageFile: null
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setData({ ...data, imageFile: files[0] });
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });

    formData.append('type', type);

    try {
      await axios.post(`${API_URL}/api/canvas/add`, formData);
      setMessage('Element successfully added!');
      setIsError(false);
    } catch (error) {
      console.error('Error adding element:', error);
      setMessage('Failed to add element. Check console for details.');
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Element</h3>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="text">Text</option>
        <option value="image">Image</option>
      </select>

      <div>
        <label>X: </label>
        <input type="number" name="x" onChange={handleChange} />
        <label>Y: </label>
        <input type="number" name="y" onChange={handleChange} />
      </div>

      {(type === 'rectangle' || type === 'image') && (
        <>
          <label>Width: </label>
          <input type="number" name="width" onChange={handleChange} />
          <label>Height: </label>
          <input type="number" name="height" onChange={handleChange} />
        </>
      )}

      {type === 'circle' && (
        <>
          <label>Radius: </label>
          <input type="number" name="radius" onChange={handleChange} />
        </>
      )}

      {type === 'text' && (
        <>
          <label>Text: </label>
          <input name="text" onChange={handleChange} />
          <label>Font Size: </label>
          <input type="number" name="fontSize" onChange={handleChange} />
        </>
      )}

      {type === 'image' && (
        <>
          <label>Image URL: </label>
          <input name="imageUrl" onChange={handleChange} />
          <br />
          <label>Or Upload Image: </label>
          <input type="file" name="imageFile" onChange={handleChange} />
        </>
      )}

      <label>Color: </label>
      <input name="color" onChange={handleChange} />

      <button type="submit">Add Element</button>
      {message && (
        <div className="message-container" style={{ marginTop: '10px' }}>
          <span style={{ color: isError ? 'red' : 'green' }}>{message}</span>
        </div>
      )}
    </form>
  );
};

export default ElementForm;
