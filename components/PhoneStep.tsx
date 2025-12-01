
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, X } from 'lucide-react';
import { formatPhoneNumber, COUNTRIES } from '../utils';

interface PhoneStepProps {
  onContinue: (phone: string) => void;
  isLoading: boolean;
  blockError: string | null;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ onContinue, isLoading, blockError }) => {
  const [phone, setPhone] = useState('');
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  const isComplete = phone.length === 10;
  // Button should be disabled if it's incomplete, loading, OR if there is a block error active
  const isDisabled = !isComplete || isLoading || blockError !== null;

  const handleSelectCountry = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setIsCountryPickerOpen(false);
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-6 relative z-10">
      {/* Help Icon */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-20">
        <HelpCircle className="w-6 h-6 text-[#999999]" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col items-center mt-8">
        {/* Header Text */}
        <h1 className="text-[26px] font-bold text-center mb-3 leading-tight tracking-tight text-[#000000]">
          С каким номером<br />телефона хотите войти?
        </h1>
        <p className="text-[#818C99] text-center mb-10 text-[16px]">
          На него придёт СМС с кодом
        </p>

        {/* Input Container */}
        <div className="w-full bg-[#F2F3F5] rounded-xl h-14 px-4 flex items-center mb-4 transition-colors focus-within:bg-[#EBEDF0]">
          <button 
            onClick={() => setIsCountryPickerOpen(true)}
            className="flex items-center h-full mr-3 select-none outline-none cursor-pointer"
          >
            <span className="text-[20px] mr-2">{selectedCountry.flag}</span>
            <span className="text-[17px] font-medium text-[#000000] ml-1">{selectedCountry.prefix}</span>
            <ChevronDown className="w-4 h-4 text-[#999999] ml-2" />
          </button>
          
          <div className="h-6 w-[1px] bg-[#C4C8CC] mx-1"></div>
          
          <input
            type="tel"
            value={formatPhoneNumber(phone)}
            onChange={handlePhoneChange}
            placeholder="123 456 78 90"
            className="flex-1 bg-transparent text-[17px] font-medium text-[#000000] placeholder-[#818C99] border-none p-0 ml-3 focus:ring-0 w-full"
            autoFocus
            disabled={blockError !== null}
          />
        </div>

        {/* Error Message (if blocked) */}
        {blockError && (
          <div className="w-full mb-4 p-3 bg-[#FFF5F6] text-[#FF3347] text-[13px] rounded-lg text-center font-medium leading-snug">
            {blockError}
          </div>
        )}

        {/* Helper Text */}
        <p className="text-[#999999] text-[13px] text-center leading-5 max-w-xs">
          Для входа нужен номер из России или страны из списка — нажмите на флаг, чтобы выбрать
        </p>
      </div>

      {/* Footer / Button */}
      <div className="mt-auto mb-10 w-full">
        <button
          disabled={isDisabled}
          onClick={() => onContinue(`${selectedCountry.prefix} ${formatPhoneNumber(phone)}`)}
          className={`w-full h-14 rounded-full font-medium text-[17px] transition-all duration-200 
            ${!isDisabled
              ? 'bg-[#2D2D2D] text-white hover:bg-black' 
              : 'bg-[#E1E3E6] text-[#999999] cursor-not-allowed'
            }`}
        >
          {isLoading ? 'Загрузка...' : 'Продолжить'}
        </button>
        
                        <p className="text-[11px] text-[#999999] text-center mt-6 leading-tight max-w-[280px] mx-auto">
          Нажимая «Продолжить», вы соглашаетесь с{' '}
          <a
            href="https://legal.max.ru/pp"
            target="_blank"
            rel="noreferrer"
            className="text-black font-medium underline"
          >
            политикой конфиденциальности
          </a>{' '}
          и{' '}
          <a
            href="https://legal.max.ru/ps"
            target="_blank"
            rel="noreferrer"
            className="text-black font-medium underline"
          >
            пользовательским соглашением
          </a>
        </p>
      </div>

      {/* Country Picker Sheet */}
      {isCountryPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsCountryPickerOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-hidden flex flex-col relative z-10 animate-slide-up sm:animate-none">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <span className="text-lg font-bold ml-2">Выберите страну</span>
              <button onClick={() => setIsCountryPickerOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelectCountry(c)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-[16px] font-medium text-black">{c.name}</span>
                  </div>
                  <span className="text-[#999999] font-medium">{c.prefix}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};


