import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-10">
      <img
        src="max-messenger-sign-logo.svg"
        alt="MAX"
        className="w-10 h-10 object-contain"
      />
      <span className="text-3xl font-bold tracking-tight text-black">мах</span>
    </div>
  );
};
