import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useOnboarding } from './context/registerContext';
import './Register.css'

function Register() {
  const navigate = useNavigate();
  const { data: onboardingData, setData: setOnboardingData } = useOnboarding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tosChecked, setTosChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    
    if (email.trim() === '') {
      newErrors.email = 'Email is required';
    }
    
    if (password.trim() === '') {
      newErrors.password = 'Password is required';
    }
    
    if (confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!tosChecked) {
      newErrors.tos = 'You must agree to the Terms of Service and Privacy Policy';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      setOnboardingData({
        ...onboardingData,
        email: email,
        password: password
      });

      const { data, error } = await authService.signUp(email, password);
      
      if (error) {
        console.log('Registration error:', error.message); // Debug log
        // Check if this is an email already exists error
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('already exists') || 
            errorMessage.includes('already registered') ||
            errorMessage.includes('account with this email')) {
          setErrors({ email: error.message });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        navigate('/register/email-confirmation');
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="register-page-container">
      <div id="header">
        <div className="logo-text" onClick={() => navigate('/')}>
          <h1>
            eventr
          </h1>
        </div>
      </div>
      <div id="register-modal-section" className="register-section">
        <div id="register-modal">
          <div id="register-modal-header">
            Create an account
          </div>
          <form className="register-form">
            <div id="register-modal-form-email" className="register-modal-form-input">
              <label>
                Email
              </label>
              <input 
                placeholder="example@email.com" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div id="register-modal-form-password" className="register-modal-form-input">
              <label>
                Password
              </label>
              <input 
                placeholder="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div id="register-modal-form-confirm-password" className="register-modal-form-input">
              <label>
                Confirm Password
              </label>
              <input 
                placeholder="confirm password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div id="register-modal-form-tos" className="register-modal-form-input">
              <input 
                type="checkbox" 
                id="register-form-tos-checkbox" 
                checked={tosChecked} 
                onChange={(e) => setTosChecked(e.target.checked)}
                disabled={isLoading}
              />
              <label>
                I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span>.
              </label>
            </div>
            <div id="register-modal-form-continue" className="register-modal-form-input">
              <button 
                id="register-form-continue" 
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Creating Account...' : 'Continue'}
              </button>
            </div>
            <div id="register-modal-form-login-switch" className="register-modal-form-input">
              <p>Already have an account?</p>
              <a onClick={() => navigate('/login')}>Log In</a>
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
      </div>
    </div>
  );
}

export default Register;