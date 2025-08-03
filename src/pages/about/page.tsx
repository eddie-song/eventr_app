import { useNavigate } from 'react-router-dom';

function AboutPage() {
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
              onClick={() => navigate('/')}
              className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
            >
              Features
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
            >
              How it works
            </button>
            <button className="bg-[#2B0A50] text-white border-[#2B0A50] border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap rounded">
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
      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#2B0A50]">
            About Encounters
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're building the future of social connection, one meaningful interaction at a time.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-[#2B0A50]">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Encounters is designed to break down the barriers that prevent people from forming meaningful connections. 
              In today's digital world, genuine social interactions have become increasingly rare. We believe everyone 
              deserves to find their tribe, discover new passions, and build lasting relationships.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our platform makes it effortless to discover people who share your interests, whether you're looking for 
              a gaming partner, a tennis buddy, or someone to join your book club. We're not just another social media 
              platform – we're a connection engine.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2B0A50]">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2B0A50]">Interest-Based Matching</h3>
              <p className="text-gray-600">
                Find people who share your specific interests, from gaming to sports to creative pursuits.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2B0A50]">Real-Time Events</h3>
              <p className="text-gray-600">
                Discover and join events happening in your area, or create your own to bring people together.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2B0A50]">Safe & Verified</h3>
              <p className="text-gray-600">
                Our community is built on trust with verified profiles and safety features to ensure genuine connections.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-[#2B0A50]">Our Team</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We're a passionate team of developers, designers, and social scientists who believe in the power of 
              human connection. Our diverse backgrounds and shared vision drive us to create a platform that truly 
              serves the community.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're constantly learning from our users and iterating on our platform to make it the best possible 
              tool for building meaningful relationships. Your feedback and experiences shape everything we do.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Connecting?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of people who are already building meaningful relationships through Encounters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-[#2B0A50] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
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

export default AboutPage;
