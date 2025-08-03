import { useNavigate } from 'react-router-dom';

function HowItWorksPage() {
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
            <button 
              onClick={() => navigate('/features')}
              className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
            >
              Features
            </button>
            <button className="bg-[#2B0A50] text-white border-[#2B0A50] border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap rounded">
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
            How Encounters
            <br />
            Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how easy it is to find meaningful connections and build lasting relationships through our simple, intuitive process.
          </p>
        </section>

        {/* Step-by-Step Process */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2B0A50]">Simple 4-Step Process</h2>
          
          {/* Step 1: Sign Up */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    1
                  </div>
                  <h3 className="text-3xl font-bold text-[#2B0A50]">Create Your Profile</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Start by creating your personalized profile. Share your interests, hobbies, and what you're looking for in connections. 
                  Our intelligent system uses this information to find people who share your passions.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add your interests and hobbies
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Upload photos and tell your story
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Set your preferences and privacy
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h4 className="text-xl font-semibold mb-2">Profile Creation</h4>
                <p className="text-sm opacity-90">Build your digital identity in minutes</p>
              </div>
            </div>
          </div>

          {/* Step 2: Discover */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h4 className="text-xl font-semibold mb-2">Smart Discovery</h4>
                  <p className="text-sm opacity-90">Find people who share your interests</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    2
                  </div>
                  <h3 className="text-3xl font-bold text-[#2B0A50]">Discover Connections</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our AI-powered algorithm analyzes your profile and finds people who share your interests, values, and lifestyle. 
                  Browse through curated matches and discover potential connections in your area.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Browse curated matches
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Filter by interests and location
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View compatibility scores
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3: Connect */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    3
                  </div>
                  <h3 className="text-3xl font-bold text-[#2B0A50]">Connect & Chat</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Once you find someone interesting, start a conversation! Our secure messaging system allows you to chat, 
                  share photos, and even make voice or video calls to get to know each other better.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Send secure messages
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Share photos and media
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Make voice/video calls
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h4 className="text-xl font-semibold mb-2">Secure Communication</h4>
                <p className="text-sm opacity-90">Chat safely with encryption</p>
              </div>
            </div>
          </div>

          {/* Step 4: Meet */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-[#2B0A50] to-[#6c3fc5] rounded-xl p-8 text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h4 className="text-xl font-semibold mb-2">Meet in Person</h4>
                  <p className="text-sm opacity-90">Turn online connections into real friendships</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    4
                  </div>
                  <h3 className="text-3xl font-bold text-[#2B0A50]">Meet & Build Relationships</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Take your connections offline! Create or join events, meetups, and activities. 
                  Whether it's a coffee meetup, a gaming session, or a hiking adventure, turn your online connections into real friendships.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create or join events
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Meet in safe public places
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2B0A50] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Build lasting friendships
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2B0A50]">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2B0A50]">Sarah & Mike</h3>
              <p className="text-gray-600 leading-relaxed">
                "We both loved hiking and found each other through Encounters. Now we go on adventures every weekend and have built an amazing friendship!"
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2B0A50]">Book Club Group</h3>
              <p className="text-gray-600 leading-relaxed">
                "Our book club started with 3 people from Encounters. Now we have 12 members and meet monthly to discuss our favorite reads!"
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2B0A50]">Gaming Squad</h3>
              <p className="text-gray-600 leading-relaxed">
                "Found my gaming crew through Encounters! We play together every night and have become the best of friends."
              </p>
            </div>
          </div>
        </section>

        {/* Safety & Trust */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#2B0A50]">Safety & Trust</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2 text-[#2B0A50]">Verified Profiles</h4>
                <p className="text-sm text-gray-600">All users are verified for authenticity</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2 text-[#2B0A50]">Privacy Controls</h4>
                <p className="text-sm text-gray-600">Control who sees your information</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2 text-[#2B0A50]">24/7 Support</h4>
                <p className="text-sm text-gray-600">Help available whenever you need it</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2 text-[#2B0A50]">Community Guidelines</h4>
                <p className="text-sm text-gray-600">Clear rules for respectful interaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of people who are already building meaningful connections through Encounters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-[#2B0A50] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => navigate('/features')}
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

export default HowItWorksPage;
