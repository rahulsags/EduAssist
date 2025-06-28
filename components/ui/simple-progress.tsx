// Simple Progress component that doesn't rely on external libraries
import React from 'react';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
}

export const SimpleProgress: React.FC<ProgressProps> = ({ 
  value = 0, 
  max = 100,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-full rounded-full" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default SimpleProgress;