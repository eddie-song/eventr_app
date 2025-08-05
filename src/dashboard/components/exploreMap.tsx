import React, { useState } from 'react';
import Map from '../../components/map/map';
import DetailsPopup from '../../components/map/detailsPopup';

const ExploreMap: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkerClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Sample locations data - you can replace this with real data from your API
  const sampleLocations = {
    'user1': { lat: 40.7128, lng: -74.0060 }, // New York
    'user2': { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    'user3': { lat: 41.8781, lng: -87.6298 }, // Chicago
  };

  return (
    <div className="h-full w-full">
      <Map onMarkerClick={handleMarkerClick} />
      <DetailsPopup isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ExploreMap;
