import React, { useState } from 'react';
import { useOnboarding } from '../context/registerContext';
import './PersonalInterests.css';

function PersonalInterests({ nextStep }) {
  const { data: onboardingData, setData: setOnboardingData } = useOnboarding();
  const [selectedInterests, setSelectedInterests] = useState(onboardingData.interests || []);
  const [selectedLocations, setSelectedLocations] = useState(onboardingData.locations || []);
  const [locationInput, setLocationInput] = useState('');
  const [errors, setErrors] = useState({});

  const interestOptions = [
    'Sports',
    'Gaming',
    'Running',
    'Fitness',
    'Music',
    'Art',
    'Cooking',
    'Travel',
    'Reading',
    'Photography',
    'Dancing',
    'Hiking',
    'Cycling',
    'Swimming',
    'Yoga',
    'Technology',
    'Movies',
    'Theater',
    'Volunteering',
    'Other'
  ];

  const majorUSCities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
    'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
    'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Long Beach', 'Colorado Springs',
    'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans',
    'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana', 'Corpus Christi', 'Riverside', 'Lexington',
    'Stockton', 'Henderson', 'Saint Paul', 'St. Louis', 'Fort Wayne', 'Jersey City', 'Chandler', 'Madison', 'Lubbock', 'Scottsdale',
    'Reno', 'Buffalo', 'Gilbert', 'Glendale', 'North Las Vegas', 'Winston-Salem', 'Chesapeake', 'Norfolk', 'Fremont', 'Garland',
    'Irving', 'Hialeah', 'Richmond', 'Boise', 'Spokane', 'Baton Rouge', 'Tacoma', 'San Bernardino', 'Grand Rapids', 'Huntsville',
    'Salt Lake City', 'Frisco', 'Yonkers', 'Amarillo', 'Glendale', 'Cape Coral', 'Laredo', 'Lancaster', 'Augusta', 'Modesto',
    'Arlington', 'Columbus', 'Tallahassee', 'Oxnard', 'Fontana', 'Moreno Valley', 'Fayetteville', 'Huntington Beach', 'Portland', 'Little Rock',
    'Worcester', 'Newark', 'Lincoln', 'Plano', 'Anchorage', 'Montgomery', 'Greensboro', 'Bakersfield', 'Toledo', 'New Orleans',
    'Cincinnati', 'Pittsburgh', 'Anchorage', 'Lexington', 'Stockton', 'Greensboro', 'Newark', 'Durham', 'St. Petersburg', 'Laredo',
    'Lubbock', 'Chandler', 'Scottsdale', 'Reno', 'Buffalo', 'Gilbert', 'Glendale', 'North Las Vegas', 'Winston-Salem', 'Chesapeake',
    'Norfolk', 'Fremont', 'Garland', 'Irving', 'Hialeah', 'Richmond', 'Boise', 'Spokane', 'Baton Rouge', 'Tacoma'
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const allValidLocations = [...majorUSCities, ...usStates];

  const handleInterestChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedInterests.includes(selectedValue)) {
      setSelectedInterests([...selectedInterests, selectedValue]);
    }
  };

  const removeInterest = (interestToRemove) => {
    setSelectedInterests(selectedInterests.filter(interest => interest !== interestToRemove));
  };

  const handleLocationInput = (e) => {
    setLocationInput(e.target.value);
    setErrors({});
  };

  const addLocation = () => {
    const trimmedInput = locationInput.trim();
    if (!trimmedInput) return;

    const normalizedInput = trimmedInput.toLowerCase();
    const isValidLocation = allValidLocations.some(location => 
      location.toLowerCase() === normalizedInput
    );

    if (isValidLocation) {
      const exactMatch = allValidLocations.find(location => 
        location.toLowerCase() === normalizedInput
      );
      if (!selectedLocations.includes(exactMatch)) {
        setSelectedLocations([...selectedLocations, exactMatch]);
        setLocationInput('');
        setErrors({});
      }
    } else {
      setErrors({ location: 'City or state not found. Please enter a major US city or state.' });
    }
  };

  const removeLocation = (locationToRemove) => {
    setSelectedLocations(selectedLocations.filter(location => location !== locationToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save data to context
    setOnboardingData({
      ...onboardingData,
      interests: selectedInterests,
      locations: selectedLocations
    });
    
    nextStep(3);
  }

  return (
    <div id="register-modal">
      <div id="register-modal-back">
        <button id="register-modal-back-button" onClick={() => nextStep(1)}>
          Back
        </button>
      </div>
      <div id="register-modal-header">
        Your interests
      </div>
      <form className="register-form">
        <div id="register-modal-form-interests" className="register-modal-form-input">
          <label>
            Your interests <span className="register-optional">(optional)</span>
          </label>
          <select 
            value="" 
            onChange={handleInterestChange}
          >
            <option value="">Select interests</option>
            {interestOptions.map((interest, index) => (
              <option key={index} value={interest}>{interest}</option>
            ))}
          </select>
          {selectedInterests.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selectedInterests.map((interest, index) => (
                <span 
                  key={index}
                  style={{
                    background: '#007AFF',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0',
                      marginLeft: '5px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div id="register-modal-form-location" className="register-modal-form-input">
          <label>
            Cities or states you're interested in <span className="register-optional">(optional)</span>
          </label>
          <input 
            placeholder="Type a major US city or state" 
            type="text" 
            value={locationInput} 
            onChange={handleLocationInput}
            onKeyPress={handleKeyPress}
          />

          {selectedLocations.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selectedLocations.map((location, index) => (
                <span 
                  key={index}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0',
                      marginLeft: '5px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
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

export default PersonalInterests;
