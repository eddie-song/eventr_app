import React, { useState } from 'react';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-[175px]">
      <div className="max-w-2xl w-full text-center">
        {/* Main Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          What are you looking for today?
        </h1>
        
        {/* Subheader */}
        <p className="text-lg text-gray-600 mb-8">
          Let us know and we'll try to find whatever you're looking for!
        </p>
        
        {/* Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-md mx-auto box-border">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for something..."
              className="w-full px-6 py-4 text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 box-border"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 bg-transparent transition-colors duration-200 border-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width={28} 
                height={28} 
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
