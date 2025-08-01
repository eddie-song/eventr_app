import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import Explore from './explore';
import Home from './home';
import Events from './events.js';
import People from './people.js';
import Social from './social';
import Profile from './profile.js';
import Plan from './plan.js';
import CreateService from './create.js';
import Notifications from './notifications';
import PlaceDetail from './PlaceDetail';
import EventDetail from './EventDetail';
import PersonDetail from './PersonDetail';
import UserProfile from './UserProfile';
import { PageCacheProvider } from '../context/PageCacheContext.js';
import { supabase } from '../../lib/supabaseClient';
import { notificationService } from '../../services/notificationService';
import FollowTest from './FollowTest';

interface DashboardProps {
  service?: string;
}

type ServiceType = 
  | 'home'
  | 'social' 
  | 'explore' 
  | 'places' 
  | 'events' 
  | 'people' 
  | 'notifications' 
  | 'profile' 
  | 'create-service' 
  | 'follow-test'
  | 'place-detail'
  | 'event-detail'
  | 'person-detail'
  | 'user-profile';

const Dashboard: React.FC<DashboardProps> = ({ service }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize selectedService from localStorage if available
  const getInitialService = (): ServiceType => {
    const saved = localStorage.getItem('dashboard_selected_service');
    return (saved as ServiceType) || 'places';
  };

  // Extract service type from current pathname
  const getServiceFromPathname = (pathname: string): ServiceType | null => {
    if (pathname.startsWith('/dashboard/place/')) {
      return 'place-detail';
    } else if (pathname.startsWith('/dashboard/event/')) {
      return 'event-detail';
    } else if (pathname.startsWith('/dashboard/person/')) {
      return 'person-detail';
    } else if (pathname.startsWith('/dashboard/user/')) {
      return 'user-profile';
    }
    return null;
  };
  
  const [selectedService, setSelectedService] = useState<ServiceType>(
    getServiceFromPathname(location.pathname) || getInitialService()
  );

  // Check for service or page query parameter and set it as selected service
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const serviceParam = urlParams.get('service') as ServiceType;
    const pageParam = urlParams.get('page') as ServiceType;
    
    // Check for service parameter first (legacy support)
    if (serviceParam && ['home', 'social', 'explore', 'places', 'events', 'people', 'notifications', 'profile', 'create-service', 'follow-test', 'place-detail', 'event-detail', 'person-detail', 'user-profile'].includes(serviceParam)) {
      setSelectedService(serviceParam);
      localStorage.setItem('dashboard_selected_service', serviceParam);
      
      // Remove the service parameter and add page parameter
      urlParams.delete('service');
      urlParams.set('page', serviceParam);
      const newSearch = urlParams.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
      navigate(newUrl, { replace: true });
    }
    // Check for page parameter
    else if (pageParam && ['home', 'social', 'explore', 'places', 'events', 'people', 'notifications', 'profile', 'create-service', 'follow-test', 'place-detail', 'event-detail', 'person-detail', 'user-profile'].includes(pageParam)) {
      setSelectedService(pageParam);
      localStorage.setItem('dashboard_selected_service', pageParam);
    }
  }, [location.search, navigate]);

  // Update selectedService when URL changes
  useEffect(() => {
    const serviceFromPath = getServiceFromPathname(location.pathname);
    
    if (serviceFromPath) {
      setSelectedService(serviceFromPath);
    } else if (location.pathname === '/dashboard' && (selectedService === 'place-detail' || selectedService === 'event-detail' || selectedService === 'person-detail' || selectedService === 'user-profile')) {
      // Reset to default service when on main dashboard
      setSelectedService(getInitialService());
    }
  }, [location.pathname, selectedService]);

  const [exploreDropdownOpen, setExploreDropdownOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);

  // Component cache to prevent re-creation
  const componentCache = useRef<Record<string, React.ReactElement>>({
    explore: <Explore key="explore" />,
    places: <Explore key="places" />,
    events: <Events key="events" />,
    people: <People key="people" />,
    social: <Social key="social" />,
    notifications: <Notifications key="notifications" />,
    profile: <Profile key="profile" />,
    'follow-test': <FollowTest key="follow-test" />,
    'create-service': <CreateService key="create-service" />,
    home: <Home key="home-new" />
  });

  // Persist selectedService to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboard_selected_service', selectedService);
  }, [selectedService]);

  const handleExploreClick = (): void => {
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

  const handleServiceClick = (serviceName: ServiceType): void => {
    setSelectedService(serviceName);
    
    // If we're currently on a detail view (place, event, person, or user profile)
    // and switching to a different service, navigate to the base dashboard URL
    if (location.pathname !== '/dashboard' && 
        (serviceName === 'social' || serviceName === 'explore' || serviceName === 'events' || 
         serviceName === 'people' || serviceName === 'profile' || serviceName === 'notifications' || 
         serviceName === 'create-service')) {
      navigate('/dashboard?page=' + serviceName);
    } else {
      // Set the page query parameter for the selected service
      const urlParams = new URLSearchParams(location.search);
      urlParams.set('page', serviceName);
      const newSearch = urlParams.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
      navigate(newUrl, { replace: true });
    }
    
    if (exploreDropdownOpen && serviceName !== 'explore') {
      setIsClosing(true);
      setTimeout(() => {
        setExploreDropdownOpen(false);
        setIsClosing(false);
      }, 250);
    }
  };

  const handleExploreOptionClick = (option: ServiceType): void => {
    setSelectedService(option);
    
    // If we're currently on a detail view and switching to an explore option,
    // navigate to the base dashboard URL
    if (location.pathname !== '/dashboard' && 
        (option === 'explore' || option === 'places')) {
      navigate('/dashboard?page=' + option);
    } else {
      // Set the page query parameter for the selected explore option
      const urlParams = new URLSearchParams(location.search);
      urlParams.set('page', option);
      const newSearch = urlParams.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
      navigate(newUrl, { replace: true });
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
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

    let subscription: any = null;

    const setupNotificationSubscription = async () => {
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
    };

    // Set up the subscription
    setupNotificationSubscription();

    // Return cleanup function that unsubscribes synchronously
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isCheckingAuth]);

  const extractIdFromPath = (idType: 'place' | 'event' | 'person' | 'user'): string | null => {
    const pathParts = location.pathname.split('/');
    const typeIndex = pathParts.indexOf(idType);
    if (typeIndex !== -1 && typeIndex + 1 < pathParts.length) {
      return pathParts[typeIndex + 1];
    }
    return null;
  };

  // Helper function to render detail views with fallback to default service
  const renderDetailView = (
    id: string | null,
    DetailComponent: React.ComponentType<any>,
    componentKey: string,
    props: Record<string, any> = {}
  ): React.ReactElement => {
    if (id) {
      return <DetailComponent key={componentKey} {...props} />;
    } else {
      // Fall back to default service if no valid ID
      const defaultService = getInitialService();
      return componentCache.current[defaultService] || componentCache.current.explore;
    }
  };

  const renderServiceContent = (): React.ReactElement => {
    if (selectedService === 'place-detail') {
      const placeId = extractIdFromPath('place');
      return renderDetailView(placeId, PlaceDetail, 'place-detail', { placeId });
    }
    
    if (selectedService === 'event-detail') {
      const eventId = extractIdFromPath('event');
      return renderDetailView(eventId, EventDetail, 'event-detail', { eventId });
    }
    
    if (selectedService === 'person-detail') {
      const personId = extractIdFromPath('person');
      return renderDetailView(personId, PersonDetail, 'person-detail', { personId });
    }
    
    if (selectedService === 'user-profile') {
      const userId = extractIdFromPath('user');
      return renderDetailView(userId, UserProfile, 'user-profile');
    }
    
    return componentCache.current[selectedService] || componentCache.current.explore;
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen text-base text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return (
    <PageCacheProvider>
      <div className="w-full max-w-full h-screen overflow-hidden box-border flex flex-row">
        {/* Sidebar */}
        <div 
          className={`bg-white flex flex-col items-center h-screen transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? 'w-[200px] min-w-[200px]' : 'w-[60px] min-w-[60px]'
          }`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => {
            setIsSidebarExpanded(false);
            // Close explore dropdown when sidebar closes
            if (exploreDropdownOpen) {
              setIsClosing(true);
              setTimeout(() => {
                setExploreDropdownOpen(false);
                setIsClosing(false);
              }, 250);
            }
          }}
        >
          {/* Logo - always visible */}
          <div className="py-5 w-full text-center">
            <h1 
              onClick={() => navigate('/')}
              className="cursor-pointer text-[#2B0A50] text-[28px]"
              style={{ paddingLeft: isSidebarExpanded ? '20px' : '0' }}
            >
              {isSidebarExpanded ? 'encounters' : 'e'}
            </h1>
          </div>
          
          {/* Service List */}
          <div className={`flex flex-col gap-4 flex-1 justify-start pt-24 transition-all duration-300 ${
            isSidebarExpanded ? 'w-4/5 pl-[20px]' : 'w-full pl-[20px]'
          }`}>
            {/* Home */}
            <div 
              className={`flex items-center cursor-pointer relative rounded-[20px] min-w-0 overflow-hidden transition-colors ${
                selectedService === 'home' ? 'bg-[#2B0A50]' : 'hover:bg-gray-100'
              } ${
                isSidebarExpanded ? 'flex-row gap-2.5 h-10 px-2.5' : 'justify-center h-10 w-10'
              }`}
              onClick={() => handleServiceClick('home')}
            >
              <div className="pt-1.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className={selectedService === 'home' ? 'text-white' : ''}>
                  <path fill="currentColor" d="M6 19h3v-5q0-.425.288-.712T10 13h4q.425 0 .713.288T15 14v5h3v-9l-6-4.5L6 10zm-2 0v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-4q-.425 0-.712-.288T13 20v-5h-2v5q0 .425-.288.713T10 21H6q-.825 0-1.412-.587T4 19m8-6.75"></path>
                </svg>
              </div>
              {isSidebarExpanded && (
                <p className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${selectedService === 'home' ? 'text-white' : ''}`}>Home</p>
              )}
            </div>

            {/* Social */}
            <div 
              className={`flex items-center cursor-pointer relative rounded-[20px] min-w-0 overflow-hidden transition-colors ${
                selectedService === 'social' ? 'bg-[#2B0A50]' : 'hover:bg-gray-100'
              } ${
                isSidebarExpanded ? 'flex-row gap-2.5 h-10 px-2.5' : 'justify-center h-10 w-10'
              }`}
              onClick={() => handleServiceClick('social')}
            >
              <div className="pt-1.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className={selectedService === 'social' ? 'text-white' : ''}>
                  <path fill="currentColor" d="M13.07 10.41a5 5 0 0 0 0-5.82A3.4 3.4 0 0 1 15 4a3.5 3.5 0 0 1 0 7a3.4 3.5 0 0 1-1.93-.59M5.5 7.5A3.5 3.5 0 1 1 9 11a3.5 3.5 0 0 1-3.5-3.5m2 0A1.5 1.5 0 1 0 9 6a1.5 1.5 0 0 0-1.5 1.5M16 17v2H2v-2s0-4 7-4s7 4 7 4m-2 0c-.14-.78-1.33-2-5-2s-4.93 1.31-5 2m11.95-4A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4Z"></path>
                </svg>
              </div>
              {isSidebarExpanded && (
                <p className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${selectedService === 'social' ? 'text-white' : ''}`}>Social</p>
              )}
            </div>

            {/* Explore */}
            <div 
              className={`flex items-center cursor-pointer relative rounded-[20px] min-w-0 overflow-hidden transition-colors ${
                selectedService === 'explore' || selectedService === 'places' || selectedService === 'events' || selectedService === 'people' ? 'bg-[#2B0A50]' : 'hover:bg-gray-100'
              } ${
                isSidebarExpanded ? 'flex-row gap-2.5 h-10 px-2.5' : 'justify-center h-10 w-10'
              }`}
              onClick={handleExploreClick}
            >
              <div className="pt-1.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className={selectedService === 'explore' || selectedService === 'places' || selectedService === 'events' || selectedService === 'people' ? 'text-white' : ''}>
                  <path fill="currentColor" d="m8.375 16.25l5.05-1.45q.5-.15.863-.513t.512-.862l1.45-5.05q.075-.275-.137-.488t-.488-.137l-5.05 1.45q-.5.15-.862.513t-.513.862l-1.45 5.05q-.075.275.138.488t.487.137M12 13.5q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5m0 8.5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.325 0 5.663-2.337T20 12t-2.337-5.663T12 4T6.337 6.338T4 12t2.338 5.663T12 20m0-8"></path>
                </svg>
              </div>
              {isSidebarExpanded && (
                <>
                  <p className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${selectedService === 'explore' || selectedService === 'places' || selectedService === 'events' || selectedService === 'people' ? 'text-white' : ''}`}>Explore</p>
                  <div className="ml-auto flex-shrink-0">
                    <svg 
                      className={`transition-transform duration-250 ease-in-out ${exploreDropdownOpen ? 'rotate-180' : ''} ${selectedService === 'explore' || selectedService === 'places' || selectedService === 'events' || selectedService === 'people' ? 'text-white' : ''}`}
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
                </>
              )}
            </div>

            {/* Explore Dropdown - only show when expanded */}
            {isSidebarExpanded && (exploreDropdownOpen || isClosing) && (
              <div className={`mt-[-20px] mb-[-10px] py-1.5 overflow-hidden gap-[100px] transition-all duration-250 ease-in-out ${
                exploreDropdownOpen && !isClosing 
                  ? 'max-h-[150px] opacity-100 translate-y-0' 
                  : isClosing 
                    ? 'max-h-0 opacity-0 -translate-y-2' 
                    : 'max-h-0 opacity-0 -translate-y-2'
              }`}>
                <div 
                  className={`py-2 px-5 cursor-pointer transition-all duration-200 ease-in-out text-sm text-gray-900 rounded-lg mx-2 my-0.5 font-normal hover:bg-black/5 hover:translate-x-0.5 ${
                    selectedService === 'places' ? 'bg-[#2B0A50] text-white font-medium hover:bg-[#2B0A50]/80' : ''
                  }`}
                  onClick={() => handleExploreOptionClick('places')}
                >
                  Places
                </div>
                <div 
                  className={`py-2 px-5 cursor-pointer transition-all duration-200 ease-in-out text-sm text-gray-900 rounded-lg mx-2 my-0.5 font-normal hover:bg-black/5 hover:translate-x-0.5 ${
                    selectedService === 'events' ? 'bg-[#2B0A50] text-white font-medium hover:bg-[#2B0A50]/80' : ''
                  }`}
                  onClick={() => handleExploreOptionClick('events')}
                >
                  Events
                </div>
                <div 
                  className={`py-2 px-5 cursor-pointer transition-all duration-200 ease-in-out text-sm text-gray-900 rounded-lg mx-2 my-0.5 font-normal hover:bg-black/5 hover:translate-x-0.5 ${
                    selectedService === 'people' ? 'bg-[#2B0A50] text-white font-medium hover:bg-[#2B0A50]/80' : ''
                  }`}
                  onClick={() => handleExploreOptionClick('people')}
                >
                  People
                </div>
              </div>
            )}

            {/* Notifications */}
            <div 
              className={`flex items-center cursor-pointer relative rounded-[20px] min-w-0 overflow-visible transition-colors ${
                selectedService === 'notifications' ? 'bg-[#2B0A50]' : 'hover:bg-gray-100'
              } ${
                isSidebarExpanded ? 'flex-row gap-2.5 h-10 px-2.5' : 'justify-center h-10 w-10'
              }`}
              onClick={() => handleServiceClick('notifications')}
            >
              <div className="pt-1.5 flex-shrink-0 relative inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className={selectedService === 'notifications' ? 'text-white' : ''}>
                  <g fill="none" fillRule="evenodd">
                    <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
                    <path fill="currentColor" d="M5 9a7 7 0 0 1 14 0v3.764l1.822 3.644A1.1 1.1 0 0 1 19.838 18h-3.964a4.002 4.002 0 0 1-7.748 0H4.162a1.1 1.1 0 0 1-.984-1.592L5 12.764zm5.268 9a2 2 0 0 0 3.464 0zM12 4a5 5 0 0 0-5 5v3.764a2 2 0 0 1-.211.894L5.619 16h12.763l-1.17-2.342a2 2 0 0 1-.212-.894V9a5 5 0 0 0-5-5"></path>
                  </g>
                </svg>
                {notificationCount > 0 && (
                  <div className="absolute -top-1.5 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[11px] flex items-center justify-center font-bold px-1 leading-none whitespace-nowrap box-border z-[9999]">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </div>
                )}
              </div>
              {isSidebarExpanded && (
                <p className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${selectedService === 'notifications' ? 'text-white' : ''}`}>Notifications</p>
              )}
            </div>

            {/* Profile */}
            <div 
              className={`flex items-center cursor-pointer relative rounded-[20px] min-w-0 overflow-hidden transition-colors ${
                selectedService === 'profile' ? 'bg-[#2B0A50]' : 'hover:bg-gray-100'
              } ${
                isSidebarExpanded ? 'flex-row gap-2.5 h-10 px-2.5' : 'justify-center h-10 w-10'
              }`}
              onClick={() => handleServiceClick('profile')}
            >
              <div className="pt-1.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className={selectedService === 'profile' ? 'text-white' : ''}>
                  <g fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinejoin="round" d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path>
                    <circle cx={12} cy={7} r={3}></circle>
                  </g>
                </svg>
              </div>
              {isSidebarExpanded && (
                <p className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${selectedService === 'profile' ? 'text-white' : ''}`}>Profile</p>
              )}
            </div>

            {/* Create */}
            <div 
              className={`flex items-center cursor-pointer relative rounded-[20px] min-w-0 overflow-hidden transition-colors ${
                selectedService === 'create-service' ? 'bg-[#2B0A50]' : 'hover:bg-gray-100'
              } ${
                isSidebarExpanded ? 'flex-row gap-2.5 h-10 px-2.5' : 'justify-center h-10 w-10'
              }`}
              onClick={() => handleServiceClick('create-service')}
            >
              <div className="pt-1.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className={selectedService === 'create-service' ? 'text-white' : ''}>
                  <path fill="currentColor" d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"></path>
                </svg>
              </div>
              {isSidebarExpanded && (
                <p className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${selectedService === 'create-service' ? 'text-white' : ''}`}>Create</p>
              )}
            </div>
          </div>
        </div>

        {/* Service Container */}
        <div className="bg-white w-full rounded-tl-[20px] p-8 overflow-y-auto h-screen box-border flex justify-center items-start">
          <div className="max-w-[1200px] w-full">
            {renderServiceContent()}
          </div>
        </div>
      </div>
    </PageCacheProvider>
  );
};

export default Dashboard;
