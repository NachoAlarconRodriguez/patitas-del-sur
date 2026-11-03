import React from 'react';
import ModernPetLoadingSpinner from './ModernPetLoadingSpinner';

export default function CatLoadingSpinner({ showSkeletons = true, customMessage = null }) {
  return (
    <ModernPetLoadingSpinner
      petType="gatos"
      showSkeletons={showSkeletons}
      customMessage={customMessage}
    />
  );
}
