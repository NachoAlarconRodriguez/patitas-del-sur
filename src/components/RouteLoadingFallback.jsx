import React from 'react';
import ModernPetLoadingSpinner from './ModernPetLoadingSpinner';

export default function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md">
        <ModernPetLoadingSpinner petType="both" showSkeletons={false} />
      </div>
    </div>
  );
}
