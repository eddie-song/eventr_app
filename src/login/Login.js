import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import './Login.css'

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await authService.signIn(email, password);
      
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="login-page-container">
      <div id="header">
        <div className="logo-text" onClick={() => navigate('/')}>
          <h1>
            eventr
          </h1>
        </div>
      </div>
      <div id="login-modal-section" className="login-section">
        <div id="login-modal">
          <div id="login-modal-header">
            Log in
          </div>
          <form className="login-form">
            <div id="login-modal-form-email" className="login-modal-form-input">
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
            <div id="login-modal-form-password" className="login-modal-form-input">
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
            <div id="login-modal-form-continue" className="login-modal-form-input">
              <button 
                id="login-form-continue" 
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Signing In...' : 'Continue'}
              </button>
            </div>
            <div id="login-modal-form-register-switch" className="login-modal-form-input">
              <p>Don't have an account?</p>
              <a onClick={() => navigate('/register')}>Sign Up</a>
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

export default Login;