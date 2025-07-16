import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './landing/Landing.js';
import Register from './register/Register.js'
import Login from './login/Login.js';
import Onboarding from './register/components/Onboarding.js';
import EmailConfirmation from './register/components/EmailConfirmation.js';
import Dashboard from './dashboard/Dashboard.js';
import { OnboardingProvider } from './register/context/registerContext';

function App() {
  return (
    <OnboardingProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register/email-confirmation' element={<EmailConfirmation />} />
        <Route path='/onboarding' element={<Onboarding />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </Router>
    </OnboardingProvider>
  );
}

export default App;
