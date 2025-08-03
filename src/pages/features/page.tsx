import { useNavigate } from 'react-router-dom';

function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div id="page-container" className="font-['Poppins',_'SF_Pro_Display',_'Helvetica_Neue',_Arial,_system-ui,_sans-serif] bg-[#fafbfc] text-[#111] m-0 p-0 min-h-screen">
      {/* Header */}
      <header id="header" className="flex flex-row h-[65px] w-full bg-white box-border">
        <div className="flex flex-row items-center">
          <div className="logo-text flex flex-row justify-center items-center w-[200px] min-w-[200px]">
            <h1 
              onClick={() => navigate('/')}
              className="cursor-pointer font-bold text-[1.5rem] text-[#2B0A50] m-0 p-0"
            >
              encounters
            </h1>
          </div>
          <div id="button-container" className="flex flex-row justify-start items-center px-5 box-border">
            <button className="bg-[#2B0A50] text-white border-[#2B0A50] border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap rounded">
              Features
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
            >
              How it works
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
            >
              About
            </button>
          </div>
        </div>
        <div id="login-buttons" className="flex flex-row justify-end items-center w-[200px] min-w-[200px] pr-5 ml-auto">
          <button 
            onClick={() => navigate('/login')}
            className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#2B0A50]">
            Powerful Features for
            <br />
            Meaningful Connections
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how Encounters makes it effortless to find your tribe, create events, and build lasting relationships.
          </p>
        </section>

        {/* Core Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2B0A50]">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Matching */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#2B0A50] text-center">Smart Matching</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Our AI-powered algorithm connects you with people who share your interests, hobbies, and lifestyle. 
                Find gaming partners, sports buddies, or creative collaborators with precision matching.
              </p>
            </div>

            {/* Real-time Events */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#2B0A50] text-center">Real-time Events</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Discover and join local events, activities, and meetups happening in your area. 
                Create your own events and bring people together around shared interests.
              </p>
            </div>

            {/* Safe & Secure */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#2B0A50] text-center">Safe & Secure</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Verified profiles, secure messaging, and community guidelines ensure your safety. 
                Our platform is built on trust with comprehensive safety features.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2B0A50]">Detailed Features</h2>
          
          {/* Feature 1: Advanced Search */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-[#2B0A50]">Advanced Search & Discovery</h3>
                <ul className="space-y-4 text-lg text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interest-based filtering and matching
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location-based discovery
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Real-time availability matching
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Compatibility scoring system
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h4 className="text-xl font-semibold mb-2">Smart Discovery</h4>
                <p className="text-sm opacity-90">Find your perfect match with our intelligent search algorithm</p>
              </div>
            </div>
          </div>

          {/* Feature 2: Event Management */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="text-xl font-semibold mb-2">Event Creation</h4>
                  <p className="text-sm opacity-90">Create and manage events with ease</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-3xl font-bold mb-6 text-[#2B0A50]">Event Management</h3>
                <ul className="space-y-4 text-lg text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create and customize events
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Real-time RSVP and attendance tracking
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location and time management
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Event recommendations and suggestions
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Messaging & Communication */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-[#2B0A50]">Messaging & Communication</h3>
                <ul className="space-y-4 text-lg text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Secure real-time messaging
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Group chat functionality
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Voice and video call support
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Message encryption and privacy
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h4 className="text-xl font-semibold mb-2">Secure Chat</h4>
                <p className="text-sm opacity-90">Connect safely with encrypted messaging</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2B0A50]">Additional Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-[#2B0A50]">Customizable Profiles</h4>
              <p className="text-sm text-gray-600">Create detailed profiles showcasing your interests and personality</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zm0 6h6V9H4v2zm0 4h6v-2H4v2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-[#2B0A50]">Analytics Dashboard</h4>
              <p className="text-sm text-gray-600">Track your connections and engagement with detailed insights</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-[#2B0A50]">Privacy Controls</h4>
              <p className="text-sm text-gray-600">Advanced privacy settings to control your information visibility</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-[#2B0A50]">Activity Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your social activity and connection growth over time</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who are already building meaningful connections with our powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-[#2B0A50] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:bg-white hover:text-[#2B0A50]"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2025 Encounters. Building meaningful connections, one encounter at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default FeaturesPage;
