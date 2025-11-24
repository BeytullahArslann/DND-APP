import React, { useEffect, useState } from 'react';

interface Die2DProps {
  sides: number;
  finalResult: number;
  rolling: boolean;
  delay?: number; // Delay before starting the "settle" animation
}

export const Die2D: React.FC<Die2DProps> = ({ sides, finalResult, rolling, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(1);
  const [internalRolling, setInternalRolling] = useState(false);

  // Manage rolling animation state
  useEffect(() => {
    if (rolling) {
      setInternalRolling(true);
      // Cycle numbers rapidly
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * sides) + 1);
      }, 80);

      return () => clearInterval(interval);
    } else {
      // When rolling stops externally, we might want to keep spinning for a moment based on delay
      // but for simplicity, let's stop and show result after a small timeout to ensure visual sync
        const timeout = setTimeout(() => {
            setDisplayValue(finalResult);
            setInternalRolling(false);
        }, delay);
        return () => clearTimeout(timeout);
    }
  }, [rolling, sides, finalResult, delay]);

  // SVG Paths for different shapes
  const getShape = () => {
    switch (sides) {
      case 4: // Triangle
        return (
          <path d="M50 15 L85 80 H15 Z" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
        );
      case 6: // Rounded Square
        return (
          <rect x="20" y="20" width="60" height="60" rx="10" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
        );
      case 8: // Diamond
        return (
           <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
        );
      case 10: // Kite / Shield shape
        return (
           <path d="M50 10 L85 40 L50 90 L15 40 Z" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
        );
      case 12: // Pentagon (approx)
        return (
          <path d="M50 10 L88 38 L73 85 H27 L12 38 Z" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
        );
      case 20: // Hexagon
      default:
        return (
          <path d="M50 10 L85 27 V68 L50 85 L15 68 V27 Z" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
        );
    }
  };

  // Color mapping based on state
  const getFillColor = () => {
     // We can make it slightly reddish while rolling
     return internalRolling ? "#D7CCC8" : "#EFEBE9";
  };

  // Dynamic classes for animation
  const containerClass = internalRolling
    ? "animate-bounce" // Simple bounce while rolling
    : "transition-transform duration-300 transform scale-100";

  return (
    <div className={`relative w-24 h-24 flex items-center justify-center select-none ${containerClass}`}>
      <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${internalRolling ? 'animate-pulse' : ''}`}>
         {/* Shape Background */}
         {React.cloneElement(getShape(), { fill: getFillColor() })}

         {/* Inner detail lines (optional, keep simple for now) */}
      </svg>

      {/* Number Display */}
      <div className={`absolute inset-0 flex items-center justify-center font-black text-[#3E2723] text-2xl z-10 ${internalRolling ? 'opacity-70 blur-[1px]' : 'opacity-100 scale-110'}`}>
        {displayValue}
      </div>
    </div>
  );
};
