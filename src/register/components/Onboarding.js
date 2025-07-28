import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Onboarding.css'
import AccountDetails from './AccountDetails';
import PersonalInterests from './PersonalInterests';
import ProgressBar from '../../components/ProgressBar';
import PublicProfile from './PublicProfile'
import FinalOnboarding from './FinalOnboarding';

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Remove the redirect to dashboard for logged-in users
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await authService.getCurrentUser();
      if (!user) {
        // User is not authenticated, redirect to login
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div id="register-page-container">
      <div id="header">
        <div className="logo-text" onClick={() => navigate('/')}>
          <h1>
            encounters
          </h1>
        </div>
      </div>
      <div id="register-onboarding-modal-section" className="register-section">
        <ProgressBar progress={step} multiplier={25} />
        {step === 1 && <AccountDetails nextStep={setStep} />}
        {step === 2 && <PersonalInterests nextStep={setStep} />}
        {step === 3 && <PublicProfile nextStep={ setStep } />}
        {step === 4 && <FinalOnboarding nextStep= { setStep }/>}
      </div>
    </div>
  );
}

export default Onboarding;