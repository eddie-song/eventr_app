import React from 'react';
import BasePersonCard from './BasePersonCard';

const PersonCard = ({ person }) => {
  return (
    <BasePersonCard 
      person={person}
      className="person-card"
      showRecommendedBadge={false}
      recommendationReason={null}
    />
  );
};

export default PersonCard; 