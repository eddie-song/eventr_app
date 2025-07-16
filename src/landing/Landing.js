import './Landing.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const searchOptions = ["Gaming Duo", "Tennis Partner", "Guitarist", "Soccer Rec League", 'UFC Watch Party']

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [svgKey, setSvgKey] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

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
          if (!hasAnimated) {
            setSvgKey(prev => prev + 1);
            setHasAnimated(true);
          }

          setTimeout(() => {
            setIsDeleting(true);
          }, 1500);
        } else {
          setIsDeleting(false);
          setCurrentIndex((currentIndex + 1) % searchOptions.length);
          setHasAnimated(false);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentIndex, hasAnimated]);

  return (
    <div id="page-container">
      <div id="header">
        <div className="logo-text">
          <h1>
            eventr
          </h1>
        </div>
        <div id="button-container">
          <button id="how-it-works">
            How it works
          </button>
          <button>
            Services
          </button>
          <button>
            About us
          </button>
        </div>
        <div id="login-buttons">
          <button id="log-in-button" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button id="sign-up-button" onClick={() => navigate('/register')}>
            Sign Up
          </button>
        </div>
      </div>
      <div id="top-section" className="section">
        <div>
          <h1 id="top-section-top-text">
            Get More Social.
          </h1>
          <h1>
            With One Click.
          </h1>
          <p id="top-section-desc">
            EVENTR is more than a social media app or a search engine.<br /> <br />
            It's an <span><i>engine</i></span> to help you get more <span className="green-text"><i>social</i></span>.
          </p>
        </div>
      </div>
      <div id="main-section" className="section">
        <h1 id="main-section-top-text">
          Search for a...
        </h1>
        <div id="main-section-search-box">
          <h2 id="main-section-search-text" className="typing-text">
            <span className="text-wrapper">{displayedText}</span><span className="cursor">|</span>
          </h2>
          <div>
            <svg key={svgKey} xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                <path strokeDasharray={40} strokeDashoffset={40} d="M10.76 13.24c-2.34 -2.34 -2.34 -6.14 0 -8.49c2.34 -2.34 6.14 -2.34 8.49 0c2.34 2.34 2.34 6.14 0 8.49c-2.34 2.34 -6.14 2.34 -8.49 0Z">
                  <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="40;0"></animate>
                </path>
                <path strokeDasharray={12} strokeDashoffset={12} d="M10.5 13.5l-7.5 7.5">
                  <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="12;0"></animate>
                </path>
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div id="third-section" className="section">
        <div id="third-header">
          <p>Find more. Meet more.</p>
        </div>
        <div id="third-main">
          <h2>
            Go out and <span><i>do more</i></span>. Ready?
          </h2>
          <button id="third-button">
            Start Exploring
            {/* <span>
              <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15">
                <path fill="currentColor" d="M8.293 2.293a1 1 0 0 1 1.414 0l4.5 4.5a1 1 0 0 1 0 1.414l-4.5 4.5a1 1 0 0 1-1.414-1.414L11 8.5H1.5a1 1 0 0 1 0-2H11L8.293 3.707a1 1 0 0 1 0-1.414"></path>
              </svg>
            </span> */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
