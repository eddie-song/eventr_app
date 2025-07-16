import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="jumping-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 