import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './landing/landing.tsx';
import Register from './register/Register.js'
import Login from './login/Login.js';
import Onboarding from './register/components/Onboarding.js';
import EmailConfirmation from './register/components/EmailConfirmation.js';
import Dashboard from './dashboard/components/dashboard.tsx';
import AboutPage from './pages/about/page.tsx';
import FeaturesPage from './pages/features/page.tsx';
import HowItWorksPage from './pages/howItWorks/page.tsx';
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
        <Route path='/about' element={<AboutPage />} />
        <Route path='/features' element={<FeaturesPage />} />
        <Route path='/how-it-works' element={<HowItWorksPage />} />
      </Routes>
    </Router>
    </OnboardingProvider>
  );
}

export default App;
