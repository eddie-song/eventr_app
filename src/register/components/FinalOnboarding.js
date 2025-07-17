import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/registerContext';
import { supabase } from '../../lib/supabaseClient';
import './FinalOnboarding.css';

function FinalOnboarding({ nextStep }) {
  const navigate = useNavigate();
  const { data: onboardingData, clear } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get current user instead of signing in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            uuid: user.id,
            email: onboardingData.email || user.email, // Always set email
            username: onboardingData.username,
            display_name: onboardingData.displayName || onboardingData.username,
            phone: onboardingData.phone,
            bio: onboardingData.bio,
            avatar_url: onboardingData.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      // Insert user interests into user_interests junction table
      if (onboardingData.interests && onboardingData.interests.length > 0) {
        const interestRecords = onboardingData.interests.map(interest => ({
          user_id: user.id,
          interest_id: interest,
          created_at: new Date().toISOString()
        }));

        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestRecords);

        if (interestsError) throw interestsError;
      }

      // Insert user locations into user_locations junction table
      if (onboardingData.locations && onboardingData.locations.length > 0) {
        const locationRecords = onboardingData.locations.map(location => ({
          user_id: user.id,
          location_name: location,
          created_at: new Date().toISOString()
        }));

        const { error: locationsError } = await supabase
          .from('user_locations')
          .insert(locationRecords);

        if (locationsError) throw locationsError;
      }

      // Clear onboarding data from context
      clear();

      // Navigate to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Clear onboarding data and navigate to dashboard
    clear();
    navigate('/dashboard');
  };

  return (
    <div id="register-modal">
      <div id="register-modal-back">
        <button id="register-modal-back-button" onClick={() => nextStep(3)}>
          Back
        </button>
      </div>
      <div id="register-modal-header">
        Last Step!
      </div>
              <div className="final-onboarding-modal">
          <div>
            <button 
              onClick={handleCompleteOnboarding}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Completing Setup...' : 'Complete Setup'}
            </button>
            <p>
              Or
            </p>
            <p id="suggested-events">Suggested events near you</p>
            <div>
              test
            </div>
          </div>
          <div>
            <button onClick={handleSkip} disabled={isLoading}>
              Skip
            </button>
          </div>
        </div>
        {/* Modern Error Display */}
        {error && (
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
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default FinalOnboarding;