import React, { useState } from 'react';
import { useOnboarding } from '../context/registerContext';
import './PublicProfile.css';

function PublicProfile({ nextStep }) {
  const { data: onboardingData, setData: setOnboardingData } = useOnboarding();
  const [bio, setBio] = useState(onboardingData.bio || '');
  const [profilePicture, setProfilePicture] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save data to context
    setOnboardingData({
      ...onboardingData,
      bio: bio.trim(),
      profilePicture: profilePicture
    });
    
    nextStep(4);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  return (
    <div id="register-modal">
      <div id="register-modal-back">
        <button id="register-modal-back-button" onClick={() => nextStep(2)}>
          Back
        </button>
      </div>
      <div id="register-modal-header">
        Your public profile
      </div>
      <form className="register-form">
        <div id="register-modal-form-picture" className="register-modal-form-input">
          <label>
            Profile picture <span className="register-optional">(optional)</span>
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange}></input>
        </div>
        <div id="register-modal-form-bio" className="register-modal-form-input">
          <label>
            Bio <span className="register-optional">(optional)</span>
          </label>
          <input placeholder="About you . . ." type="text" value={bio} onChange={(e) => setBio(e.target.value)}></input>
        </div>
        <div id="register-modal-form-continue" className="register-modal-form-input">
          <button id="register-form-continue" onClick={handleSubmit}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export default PublicProfile;