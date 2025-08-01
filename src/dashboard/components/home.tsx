import React, { useState } from 'react';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  // Dummy data for recommendations
  const recommendedEvents = [
    { id: 1, title: "Tech Meetup 2024", location: "Downtown Coffee Shop", distance: "0.5 miles", time: "Today, 7:00 PM" },
    { id: 2, title: "Art Gallery Opening", location: "Central Arts District", distance: "1.2 miles", time: "Tomorrow, 6:00 PM" },
    { id: 3, title: "Food Festival", location: "Riverside Park", distance: "2.1 miles", time: "Saturday, 12:00 PM" }
  ];

  const recommendedPlaces = [
    { id: 1, name: "The Blue Note Jazz Club", category: "Entertainment", distance: "0.8 miles", rating: "4.8" },
    { id: 2, name: "Urban Fitness Center", category: "Fitness", distance: "1.5 miles", rating: "4.6" },
    { id: 3, name: "Craft Beer Garden", category: "Food & Drink", distance: "0.3 miles", rating: "4.9" }
  ];

  const recommendedPeople = [
    { id: 1, name: "Sarah Johnson", mutualFriends: 3, distance: "0.2 miles", interests: ["Photography", "Travel"] },
    { id: 2, name: "Mike Chen", mutualFriends: 5, distance: "1.1 miles", interests: ["Tech", "Music"] },
    { id: 3, name: "Emma Rodriguez", mutualFriends: 2, distance: "0.7 miles", interests: ["Art", "Cooking"] }
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-[100px]">
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
        <form onSubmit={handleSearch} className="w-full max-w-md mx-auto box-border mb-[150px]">
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

      {/* Map and Recommendations Section */}
      <div className="w-full max-w-7xl flex gap-8">
        {/* Left side - Map */}
        <div className="flex-1">
          <div className="bg-gray-100 rounded-xl p-12 border-2 border-dashed border-gray-300 min-h-[400px]">
            <div className="flex flex-col items-center justify-center h-full">
              <svg 
                className="w-24 h-24 text-gray-400 mb-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">Interactive Map</h3>
              <p className="text-gray-500 text-center max-w-lg text-lg">
                This is where the interactive map will be displayed. 
                Users will be able to explore events, places, and people in their area.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Recommendations */}
        <div className="w-80 flex-shrink-0 border-2 border-gray-300 rounded-xl p-6 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
          
          {/* Scrollable container for recommendations */}
          <div className="h-[500px] overflow-y-auto pr-2 space-y-6">
            {/* Events Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Events
              </h3>
              <div className="space-y-3">
                {recommendedEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{event.time}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{event.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Places Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Places
              </h3>
              <div className="space-y-3">
                {recommendedPlaces.map((place) => (
                  <div key={place.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">{place.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{place.category}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {place.rating}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{place.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* People Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                People
              </h3>
              <div className="space-y-3">
                {recommendedPeople.map((person) => (
                  <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">{person.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{person.mutualFriends} mutual friends</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {person.interests.map((interest, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{person.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
