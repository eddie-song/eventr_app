import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const searchOptions: string[] = ["Gaming Duo", "Tennis Partner", "Guitarist", "Soccer Rec League", 'UFC Watch Party'];

  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const currentString = searchOptions[currentIndex];
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting && displayedText.length < currentString.length) {
        setDisplayedText(currentString.substring(0, displayedText.length + 1));
      } else if (isDeleting && displayedText.length > 0) {
        setDisplayedText(currentString.substring(0, displayedText.length - 1));
      } else {
        if (!isDeleting) {
          setTimeout(() => {
            setIsDeleting(true);
          }, 1500);
        } else {
          setIsDeleting(false);
          setCurrentIndex((currentIndex + 1) % searchOptions.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentIndex]);

  return (
    <div id="page-container" className="font-['Poppins',_'SF_Pro_Display',_'Helvetica_Neue',_Arial,_system-ui,_sans-serif] bg-[#fafbfc] text-[#111] m-0 p-0 min-h-screen">
      {/* Header */}
      <header id="header" className="flex flex-row h-[65px] w-full bg-white box-border">
        <div className="flex flex-row items-center">
          <div className="logo-text flex flex-row justify-center items-center w-[200px] min-w-[200px]">
            <h1 className="cursor-pointer font-bold text-[1.5rem] text-[#2B0A50] m-0 p-0">encounters</h1>
          </div>
          <div id="button-container" className="flex flex-row justify-start items-center px-5 box-border">
            <button 
              onClick={() => navigate('/features')}
              className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap"
            >
              Features
            </button>
            <button className="bg-transparent border-white border-solid border h-[35px] mx-[10px] cursor-pointer px-[15px] whitespace-nowrap">How it works</button>
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

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-12">
          The Social
          <br />
          Connection Platform
        </h1>
        <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
          Built to make you extraordinarily social, encounters is the best way to connect with people who share your interests.
        </p>
        
        {/* Search Bar */}
        <div className="mb-20">
          <h2 className="font-normal text-[1.5rem] mb-[18px]">Search for a...</h2>
          <div className="bg-[rgba(255,255,255,0.7)] shadow-[0_4px_32px_0_rgba(43,10,80,0.10)] px-8 rounded-[40px] w-[480px] max-w-[90vw] flex flex-row justify-between items-center border-[1.5px] border-[#e5e5ea] mx-auto backdrop-blur-[8px] transition-[box-shadow_0.2s] focus-within:shadow-[0_8px_40px_0_rgba(43,10,80,0.16)]">
            <h2 className="w-[80%] text-[1.35rem] font-normal text-[#222] tracking-[0.01em] whitespace-nowrap font-inherit text-left">
              <span className="font-normal tracking-[0.01em]">{displayedText}</span>
              <span className="inline-block w-[1ch] animate-[blink_1s_infinite] text-[#2B0A50] font-semibold">|</span>
            </h2>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <path d="M10.76 13.24c-2.34 -2.34 -2.34 -6.14 0 -8.49c2.34 -2.34 6.14 -2.34 8.49 0c2.34 2.34 2.34 6.14 0 8.49c-2.34 2.34 -6.14 2.34 -8.49 0Z"></path>
                  <path d="M10.5 13.5l-7.5 7.5"></path>
                </g>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] border-none text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-gradient-to-l hover:from-[#4a1a8a] hover:to-[#8b5cf6]"
          >
            Get Started Free
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-transparent border-2 border-[#2B0A50] text-[#2B0A50] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:bg-[#2B0A50] hover:text-white"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              Our AI connects you with people who share your interests, hobbies, and lifestyle.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Events</h3>
            <p className="text-gray-600">
              Discover and join local events, activities, and meetups happening in your area.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#2B0A50] rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-gray-600">
              Verified profiles, secure messaging, and community guidelines ensure safety.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center mb-10">
        <h2 className="text-4xl font-bold mb-20">Ready to start connecting?</h2>
        <button 
          onClick={() => navigate('/register')}
          className="bg-gradient-to-r from-[#2B0A50] to-[#6c3fc5] border-none text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-gradient-to-l hover:from-[#4a1a8a] hover:to-[#8b5cf6]"
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">encounters</h3>
              <p className="text-gray-600 text-sm">
                Connecting people through shared interests and meaningful experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-black list-none pl-0">
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Features</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">How it Works</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Safety</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-black list-none pl-0">
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">About Us</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Careers</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Press</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-black list-none pl-0">
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Help Center</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Community</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Privacy Policy</a></li>
                <li className="pl-0"><a href="#" className="no-underline hover:text-gray-600 transition-colors text-black">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 encounters. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        
        #page-container #button-container button {
          background-color: transparent;
          border: white solid 1px;
          height: 35px;
          margin: 0px 10px;
          cursor: pointer;
          padding: 0 15px;
          white-space: nowrap;
        }
        #page-container #button-container button:hover {
          border-bottom: black solid 1px;
        }
        
        #page-container #login-buttons button {
          background-color: transparent;
          border: white solid 1px;
          height: 35px;
          margin: 0px 10px;
          cursor: pointer;
          padding: 0 15px;
          white-space: nowrap;
        }
        #page-container #login-buttons button:hover {
          border-bottom: black solid 1px;
        }
      `}</style>
    </div>
  );
}

export default Landing;
