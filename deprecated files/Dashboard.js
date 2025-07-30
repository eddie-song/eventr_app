import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';
import Explore from './components/explore.js';
import Home from './components/home.js';
import Events from './components/events.js';
import People from './components/people.js';
import Social from './components/social.js';
import Profile from './components/profile.js';
import Plan from './components/plan.js';
import CreateService from './components/create.js';
import Notifications from './components/notifications.tsx';
import PlaceDetail from './components/PlaceDetail.tsx';
import EventDetail from './components/EventDetail.tsx';
import PersonDetail from './components/PersonDetail.tsx';
import UserProfile from './components/UserProfile.tsx';
import { PageCacheProvider } from './context/PageCacheContext.js';
import { supabase } from '../lib/supabaseClient';
import { notificationService } from '../services/notificationService';
import FollowTest from './components/FollowTest.tsx';

function Dashboard({ service }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize selectedService from localStorage if available
  const getInitialService = () => {
    const saved = localStorage.getItem('dashboard_selected_service');
    return saved || 'social';
  };

  // Helper function to determine service based on current URL
  const getServiceFromUrl = (pathname) => {
    if (pathname.startsWith('/dashboard/place/')) {
      return 'place-detail';
    } else if (pathname.startsWith('/dashboard/event/')) {
      return 'event-detail';
    } else if (pathname.startsWith('/dashboard/person/')) {
      return 'person-detail';
    } else if (pathname.startsWith('/dashboard/user/')) {
      return 'user-profile';
    } else {
      return getInitialService();
    }
  };
  
  const [selectedService, setSelectedService] = useState(
    getServiceFromUrl(location.pathname)
  );

  // Update selectedService when URL changes
  useEffect(() => {
    const newService = getServiceFromUrl(location.pathname);
    
    // Only update if the service has actually changed
    if (newService !== selectedService) {
      setSelectedService(newService);
    }
  }, [location.pathname, selectedService]);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // Component cache to prevent re-creation
  const componentCache = useRef({
    explore: <Explore key="explore" />,
    places: <Explore key="places" />,
    events: <Events key="events" />,
    people: <People key="people" />,
    social: <Social key="social" />,
    notifications: <Notifications key="notifications" />,
    profile: <Profile key="profile" />,
    'follow-test': <FollowTest key="follow-test" />,
    'create-service': <CreateService key="create-service" />
  });

  // Persist selectedService to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboard_selected_service', selectedService);
  }, [selectedService]);

  const handleExploreClick = () => {
    if (exploreDropdownOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setExploreDropdownOpen(false);
        setIsClosing(false);
      }, 250);
    } else {
      setExploreDropdownOpen(true);
    }
  };

  const handleServiceClick = (serviceName) => {
    setSelectedService(serviceName);
    
    // If we're currently on a detail view (place, event, person, or user profile)
    // and switching to a different service, navigate to the base dashboard URL
    if (location.pathname !== '/dashboard' && 
        (serviceName === 'social' || serviceName === 'explore' || serviceName === 'events' || 
         serviceName === 'people' || serviceName === 'profile' || serviceName === 'notifications' || 
         serviceName === 'create-service')) {
      navigate('/dashboard');
    }
    
    if (exploreDropdownOpen && serviceName !== 'explore') {
      setIsClosing(true);
      setTimeout(() => {
        setExploreDropdownOpen(false);
        setIsClosing(false);
      }, 250);
    }
  };

  const handleExploreOptionClick = (option) => {
    setSelectedService(option);
    
    // If we're currently on a detail view and switching to an explore option,
    // navigate to the base dashboard URL
    if (location.pathname !== '/dashboard' && 
        (option === 'explore' || option === 'places')) {
      navigate('/dashboard');
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await authService.getCurrentUser();
        if (!user) {
          // User is not authenticated, clear service selection and redirect to login
          localStorage.removeItem('dashboard_selected_service');
          navigate('/login');
        } else {
          // User is authenticated, now check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('uuid')
            .eq('uuid', user.id)
            .single();
          if (!profile) {
            // Profile not found, clear service selection and redirect to onboarding
            localStorage.removeItem('dashboard_selected_service');
            navigate('/onboarding');
            return;
          }
          setIsCheckingAuth(false);
          
          // Get notification count
          try {
            const counts = await notificationService.getNotificationCount();
            setNotificationCount(counts.total);
          } catch (error) {
            console.error('Error getting notification count:', error);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If there's an error checking auth, clear service selection and redirect to login for safety
        localStorage.removeItem('dashboard_selected_service');
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Real-time notification count updates
  useEffect(() => {
    if (isCheckingAuth) return; // Don't subscribe until auth is checked

    let subscription = null;

    const setupNotificationSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Subscribe to notification changes
        subscription = supabase
          .channel('notifications')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            }, 
            async () => {
              // Refresh notification count when notifications change
              try {
                const counts = await notificationService.getNotificationCount();
                setNotificationCount(counts.total);
              } catch (error) {
                console.error('Error updating notification count:', error);
              }
            }
          )
          .subscribe();

        console.log('Notification subscription established successfully');
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    setupNotificationSubscription();

    // Return cleanup function
    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('Notification subscription cleaned up successfully');
        } catch (error) {
          console.error('Error cleaning up notification subscription:', error);
        }
      }
    };
  }, [isCheckingAuth]);

  // Extract ID from URL path based on the specified segment
  const extractIdFromPath = (segment) => {
    const pathParts = location.pathname.split('/');
    const segmentIndex = pathParts.indexOf(segment);
    if (segmentIndex !== -1 && segmentIndex + 1 < pathParts.length) {
      return pathParts[segmentIndex + 1];
    }
    return null;
  };

  const renderServiceContent = () => {
    if (selectedService === 'place-detail') {
      const placeId = extractIdFromPath('place');
      // Only render PlaceDetail if we have a valid placeId
      if (placeId) {
        return <PlaceDetail key="place-detail" placeId={placeId} />;
      } else {
        // If no placeId, fall back to default service
        const defaultService = getInitialService();
        return componentCache.current[defaultService] || componentCache.current.explore;
      }
    }
    
    if (selectedService === 'event-detail') {
      const eventId = extractIdFromPath('event');
      // Only render EventDetail if we have a valid eventId
      if (eventId) {
        return <EventDetail key="event-detail" eventId={eventId} />;
      } else {
        // If no eventId, fall back to default service
        const defaultService = getInitialService();
        return componentCache.current[defaultService] || componentCache.current.explore;
      }
    }
    
    if (selectedService === 'person-detail') {
      const personId = extractIdFromPath('person');
      // Only render PersonDetail if we have a valid personId
      if (personId) {
        return <PersonDetail key="person-detail" personId={personId} />;
      } else {
        // If no personId, fall back to default service
        const defaultService = getInitialService();
        return componentCache.current[defaultService] || componentCache.current.explore;
      }
    }
    
    if (selectedService === 'user-profile') {
      const userId = extractIdFromPath('user');
      // Only render UserProfile if we have a valid userId
      if (userId) {
        return <UserProfile key="user-profile" userId={userId} />;
      } else {
        // If no userId, fall back to default service
        const defaultService = getInitialService();
        return componentCache.current[defaultService] || componentCache.current.explore;
      }
    }
    
    return componentCache.current[selectedService] || componentCache.current.explore;
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#86868b'
      }}>
        Checking authentication...
      </div>
    );
  }

  return (
    <PageCacheProvider>
    <div id="dashboard-page-container">
      <div id="dashboard-side-bar">
        <div className="logo-text">
          <h1 onClick={() => navigate('/')}>
          encounters
          </h1>
        </div>
        <div id="service-list">
          <div 
            id="service-list-item"
            className={selectedService === 'social' ? 'selected' : ''}
            onClick={() => handleServiceClick('social')}
          >
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <path fill="currentColor" d="M13.07 10.41a5 5 0 0 0 0-5.82A3.4 3.4 0 0 1 15 4a3.5 3.5 0 0 1 0 7a3.4 3.5 0 0 1-1.93-.59M5.5 7.5A3.5 3.5 0 1 1 9 11a3.5 3.5 0 0 1-3.5-3.5m2 0A1.5 1.5 0 1 0 9 6a1.5 1.5 0 0 0-1.5 1.5M16 17v2H2v-2s0-4 7-4s7 4 7 4m-2 0c-.14-.78-1.33-2-5-2s-4.93 1.31-5 2m11.95-4A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4Z"></path>
              </svg>
            </div>
            <p>Social</p>
          </div>
          <div 
            id="service-list-item" 
            className={selectedService === 'explore' ? 'selected' : ''}
            onClick={handleExploreClick}
          >
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <path fill="currentColor" d="m8.375 16.25l5.05-1.45q.5-.15.863-.513t.512-.862l1.45-5.05q.075-.275-.137-.488t-.488-.137l-5.05 1.45q-.5.15-.862.513t-.513.862l-1.45 5.05q-.075.275.138.488t.487.137M12 13.5q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5m0 8.5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.325 0 5.663-2.337T20 12t-2.337-5.663T12 4T6.337 6.338T4 12t2.338 5.663T12 20m0-8"></path>
              </svg>
            </div>
            <p>Explore</p>
            <div>
              <svg 
                className={`dropdown-icon ${exploreDropdownOpen ? 'rotated' : ''}`}
                xmlns="http://www.w3.org/2000/svg" 
                width={24} 
                height={24} 
                viewBox="0 0 24 24"
              >
                <g fill="none" fillRule="evenodd">
                  <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
                  <path fill="currentColor" d="M12.707 15.707a1 1 0 0 1-1.414 0L5.636 10.05A1 1 0 1 1 7.05 8.636l4.95 4.95l4.95-4.95a1 1 0 0 1 1.414 1.414z"></path>
                </g>
              </svg>
            </div>
          </div>
          {(exploreDropdownOpen || isClosing) && (
            <div id="explore-dropdown" className={exploreDropdownOpen && !isClosing ? 'open' : isClosing ? 'closing' : ''}>
                <div 
                  className={`explore-option ${selectedService === 'places' ? 'selected' : ''}`} 
                  onClick={() => handleExploreOptionClick('places')}
                >
                  Places
                </div>
                <div 
                  className={`explore-option ${selectedService === 'events' ? 'selected' : ''}`} 
                  onClick={() => handleExploreOptionClick('events')}
                >
                  Events
                </div>
                <div 
                  className={`explore-option ${selectedService === 'people' ? 'selected' : ''}`} 
                  onClick={() => handleExploreOptionClick('people')}
                >
                  People
                </div>
            </div>
          )}
          {/* <div 
            id="service-list-item"
            className={selectedService === 'deep-search' ? 'selected' : ''}
            onClick={() => handleServiceClick('deep-search')}
          >
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"></path>
              </svg>
            </div>
            <p>Deep Search</p>
          </div> */}
          <div 
            id="service-list-item"
            className={selectedService === 'notifications' ? 'selected' : ''}
            onClick={() => handleServiceClick('notifications')}
            style={{ overflow: 'visible' }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <g fill="none" fillRule="evenodd">
                  <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
                  <path fill="currentColor" d="M5 9a7 7 0 0 1 14 0v3.764l1.822 3.644A1.1 1.1 0 0 1 19.838 18h-3.964a4.002 4.002 0 0 1-7.748 0H4.162a1.1 1.1 0 0 1-.984-1.592L5 12.764zm5.268 9a2 2 0 0 0 3.464 0zM12 4a5 5 0 0 0-5 5v3.764a2 2 0 0 1-.211.894L5.619 16h12.763l-1.17-2.342a2 2 0 0 1-.212-.894V9a5 5 0 0 0-5-5"></path>
                </g>
              </svg>
              {notificationCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  padding: '0 4px',
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  zIndex: 9999
                }}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </div>
              )}
            </div>
            <p>Notifications</p>
          </div>
          <div 
            id="service-list-item"
            className={selectedService === 'profile' ? 'selected' : ''}
            onClick={() => handleServiceClick('profile')}
          >
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinejoin="round" d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path>
                  <circle cx={12} cy={7} r={3}></circle>
                </g>
              </svg>
            </div>
            <p>Profile</p>
            </div>
            {/* <div 
              id="service-list-item"
              className={selectedService === 'plan' ? 'selected' : ''}
              onClick={() => handleServiceClick('plan')}
            >
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0"></path>
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0"></path>
                </g>
              </svg>
            </div>
            <p>Plan</p>
          </div> */}
          <div 
            id="service-list-item"
            className={selectedService === 'create-service' ? 'selected' : ''}
            onClick={() => handleServiceClick('create-service')}
          >
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                <path fill="currentColor" d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"></path>
              </svg>
            </div>
            <p>Create</p>
          </div>
        </div>
      </div>
      <div id="service-container">
        {renderServiceContent()}
      </div>
    </div>
    </PageCacheProvider>
  );
}

export default Dashboard;
