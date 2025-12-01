
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface CodeStepProps {
  phone: string;
  onBack: () => void;
  onAttempt: (code: string) => void;
  isLoading: boolean;
  blockError: string | null;
}

export const CodeStep: React.FC<CodeStepProps> = ({ phone, onBack, onAttempt, isLoading, blockError }) => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(59);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBlocked = blockError !== null && (blockError.includes('24 часа') || blockError.includes('Слишком много попыток'));

  useEffect(() => {
    if (timer > 0 && !isBlocked) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isBlocked]);

  useEffect(() => {
    if (blockError) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // We don't clear code if fully blocked to allow user to see the error state clearly
      if (!isBlocked) {
          setCode('');
      }
    }
  }, [blockError, isBlocked]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If blocked, prevent typing
    if (isBlocked) return;

    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 6) {
      setCode(val);
      if (val.length === 6) {
        onAttempt(val);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-6 relative z-10 pt-6">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col items-center mt-6">
        <h1 className="text-[26px] font-bold text-center mb-3 text-[#000000]">
          Введите код
        </h1>
        <p className="text-[#818C99] text-center mb-10 text-[16px]">
          Мы отправили его на номер <br />
          <span className="font-medium text-black">{phone}</span>
        </p>

        {/* Code Input */}
        <div
          className={`relative mb-8 ${shake ? 'animate-shake' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Hidden technical input */}
          <input
            ref={inputRef}
            type="tel"
            value={code}
            onChange={handleCodeChange}
            className="absolute inset-0 opacity-0 pointer-events-auto"
            autoFocus
            maxLength={6}
            disabled={isLoading || isBlocked}
          />

          {/* Visible boxes */}
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, idx) => {
              const digit = code[idx] ?? '';
              const hasError = !!blockError && !isBlocked; // wrong code error state
              return (
                <div
                  key={idx}
                  className={`w-11 h-14 flex items-center justify-center rounded-xl text-[22px] font-semibold select-none transition-colors
                    ${digit ? 'bg-[#F5F6F8] text-[#000000]' : 'bg-[#F2F3F5] text-[#000000]'}
                    ${hasError ? 'border border-[#FF3347] bg-[#FFF5F6]' : 'border border-transparent'}`}
                >
                  {digit || ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        <div className="h-6 mb-2 w-full">
            {blockError && (
            <p className="text-[#FF3347] text-[14px] font-normal text-center leading-tight">
                {blockError}
            </p>
            )}
        </div>

        {/* Resend Section - HIDE if blocked */}
        {!isBlocked && (
            <div className="mt-4">
                <p className="text-[#999999] text-[14px] text-center">
                    Код не пришёл? <br />
                    {timer > 0 ? (
                    <span className="text-[#C4C8CC]">Отправить повторно через {timer} сек</span>
                    ) : (
                    <button 
                        onClick={() => {
                            if(!isBlocked) {
                                setTimer(59);
                            }
                        }}
                        className="text-[#3F8AE0] font-medium hover:opacity-80 transition-opacity"
                    >
                        Отправить снова
                    </button>
                    )}
                </p>
            </div>
        )}
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
