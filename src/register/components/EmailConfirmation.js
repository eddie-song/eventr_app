import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/registerContext';
import { authService } from '../../services/authService';
import './EmailConfirmation.css';

function EmailConfirmation() {
  const navigate = useNavigate();
  const { data: onboardingData } = useOnboarding();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await authService.getCurrentUser();
      if (user) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleResendEmail = async () => {
    // TODO: Implement resend email functionality
    console.log('Resend email clicked');
  };

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div id="register-page-container">
      <div id="header">
        <div className="logo-text" onClick={() => navigate('/')} style={{ paddingLeft: '20px' }}>
          <h1>
            encounters
          </h1>
        </div>
      </div>
      <div id="register-modal-section" className="register-section">
        <div id="register-modal">
          <div id="register-modal-header">
            Check your email
          </div>
          <div className="email-confirmation-content">
            <div className="email-icon">
              📧
            </div>
            <h2>We've sent you a confirmation email</h2>
            <p>
              We sent a confirmation link to <strong>{onboardingData.email}</strong>
            </p>
            <p>
              Click the link in the email to verify your account and continue with onboarding.
            </p>
            <div className="email-confirmation-actions">
              <button 
                className="resend-button"
                onClick={handleResendEmail}
              >
                Resend email
              </button>
              <button 
                className="continue-button"
                onClick={handleContinue}
              >
                Continue to login
              </button>
            </div>
            <div className="email-confirmation-footer">
              <p>Didn't receive the email? Check your spam folder.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmation; 