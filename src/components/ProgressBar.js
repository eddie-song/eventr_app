import { useState } from 'react';
import './ProgressBar.css';

function ProgressBar({ progress, multiplier }) {
  return (
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{ height: `${progress * multiplier}%` }}
      />
    </div>
  );
}

export default ProgressBar;
