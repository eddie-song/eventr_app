import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './landing/landing.tsx';
import Register from './register/Register.js'
import Login from './login/Login.js';
import Onboarding from './register/components/Onboarding.js';
import EmailConfirmation from './register/components/EmailConfirmation.js';
import Dashboard from './dashboard/components/dashboard.tsx';
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
        <Route path='/dashboard/user/:userId' element={<Dashboard />} />
        <Route path='/dashboard/place/:placeId' element={<Dashboard />} />
        <Route path='/dashboard/event/:eventId' element={<Dashboard />} />
        <Route path='/dashboard/person/:personId' element={<Dashboard />} />
      </Routes>
    </Router>
    </OnboardingProvider>
  );
}

export default App;
