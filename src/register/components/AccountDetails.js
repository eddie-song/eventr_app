import React, { useState } from 'react';
import { useOnboarding } from '../context/registerContext';
import './AccountDetails.css';

function AccountDetails({ nextStep }) {
  const { data: onboardingData, setData: setOnboardingData } = useOnboarding();
  const [username, setUsername] = useState(onboardingData.username || '');
  const [displayName, setDisplayName] = useState(onboardingData.displayName || '');
  const [phone, setPhone] = useState(onboardingData.phone || '');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    
    if (username.trim() === '') {
      newErrors.username = 'Username is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save data to context
    setOnboardingData({
      ...onboardingData,
      username: username.trim(),
      displayName: displayName.trim(),
      phone: phone.trim()
    });
    
    nextStep(2);
  }

  return (
    <div id="register-modal">
      <div id="register-modal-header">
        Account details
      </div>
      <form className="register-form">
        <div id="register-modal-form-username" className="register-modal-form-input">
          <label>
            User name
          </label>
          <input placeholder="johndoe1" type="text" value={username} onChange={(e) => setUsername(e.target.value)}></input>
        </div>
        <div id="register-modal-form-displayname" className="register-modal-form-input">
          <label>
            Display name <span className="register-optional">(optional)</span>
          </label>
          <input placeholder="johndoe1" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}></input>
        </div>
        <div id="register-modal-form-phone" className="register-modal-form-input">
          <label>
            Phone number <span className="register-optional">(optional)</span>
          </label>
          <input placeholder="123-456-7890" type="text" value={phone} onChange={(e) => setPhone(e.target.value)}></input>
        </div>
        <div id="register-modal-form-continue" className="register-modal-form-input">
          <button id="register-form-continue" onClick={handleSubmit}>
            Continue
          </button>
        </div>
        {/* Modern Error Display */}
        {Object.keys(errors).length > 0 && (
          <div style={{ 
            marginTop: '20px',
            animation: 'slideInUp 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              color: 'white',
              fontSize: '14px',
              padding: '16px 20px',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '3px',
                background: 'linear-gradient(90deg, #ff8a80, #ff5722)'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  fontSize: '18px',
                  lineHeight: '1'
                }}>
                  ⚠️
                </div>
                <div style={{
                  flex: '1',
                  lineHeight: '1.4'
                }}>
                  {Object.values(errors).map((error, index) => (
                    <div key={index} style={{
                      marginBottom: index < Object.values(errors).length - 1 ? '4px' : '0'
                    }}>
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AccountDetails;
