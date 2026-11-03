import React from 'react';
import ModernPetLoadingSpinner from './ModernPetLoadingSpinner';

export default function DogLoadingSpinner({ showSkeletons = true, customMessage = null }) {
  return (
    <ModernPetLoadingSpinner
      petType="perros"
      showSkeletons={showSkeletons}
      customMessage={customMessage}
    />
  );
}
