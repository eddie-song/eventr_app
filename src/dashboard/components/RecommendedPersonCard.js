import React from 'react';
import BasePersonCard from './BasePersonCard';

const RecommendedPersonCard = ({ person }) => {
  return (
    <BasePersonCard 
      person={person}
      className="recommended-person-card"
      showRecommendedBadge={true}
      recommendationReason={person.reason}
    />
  );
};

export default RecommendedPersonCard; 