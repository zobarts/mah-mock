
import { BlockState } from './types';

const STORAGE_KEY = 'max_auth_block_state_v2';

// Phone request timeouts (for "Too many attempts" on getting code)
const PHONE_TIMEOUTS = [
  3 * 60 * 1000,       // 3 minutes
  15 * 60 * 1000,      // 15 minutes
  60 * 60 * 1000,      // 1 hour
  24 * 60 * 60 * 1000, // 24 hours
];

export const COUNTRIES = [
  { code: 'RU', name: 'Россия', prefix: '+7', flag: '🇷🇺' },
  { code: 'BY', name: 'Беларусь', prefix: '+375', flag: '🇧🇾' },
  { code: 'AZ', name: 'Азербайджан', prefix: '+994', flag: '🇦🇿' },
  { code: 'AM', name: 'Армения', prefix: '+374', flag: '🇦🇲' },
  { code: 'KZ', name: 'Казахстан', prefix: '+7', flag: '🇰🇿' },
  { code: 'KG', name: 'Кыргызстан', prefix: '+996', flag: '🇰🇬' },
  { code: 'MD', name: 'Молдова', prefix: '+373', flag: '🇲🇩' },
  { code: 'TJ', name: 'Таджикистан', prefix: '+992', flag: '🇹🇯' },
  { code: 'UZ', name: 'Узбекистан', prefix: '+998', flag: '🇺🇿' },
  { code: 'GE', name: 'Грузия', prefix: '+995', flag: '🇬🇪' },
];

export const getBlockState = (): BlockState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { isBlocked: false, blockUntil: 0, attemptLevel: 0, codeFailures: 0 };
  }
  
  const parsed = JSON.parse(stored) as BlockState;
  
  // Check if block has expired
  if (parsed.isBlocked && Date.now() > parsed.blockUntil) {
    return { ...parsed, isBlocked: false, codeFailures: 0 };
  }
  
  return parsed;
};

// Simulate "Too many SMS requests" block
export const registerPhoneAttemptBlock = (): BlockState => {
  const current = getBlockState();
  const nextLevel = Math.min(current.attemptLevel, PHONE_TIMEOUTS.length - 1);
  const duration = PHONE_TIMEOUTS[nextLevel];
  const blockUntil = Date.now() + duration;
  
  const newState: BlockState = {
    ...current,
    isBlocked: true,
    blockUntil,
    attemptLevel: current.attemptLevel + 1
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

// Record a wrong code entry
export const registerCodeFailure = (): BlockState => {
  const current = getBlockState();
  const newFailures = (current.codeFailures || 0) + 1;
  
  let newState: BlockState = {
    ...current,
    codeFailures: newFailures
  };

  // If 3 wrong attempts, block for 24 hours
  if (newFailures >= 3) {
    newState.isBlocked = true;
    newState.blockUntil = Date.now() + (24 * 60 * 60 * 1000);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '0:00';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) return `${hours} ч ${minutes} мин`;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatPhoneNumber = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 0) return '';
  
  let formatted = '';
  if (clean.length > 0) formatted += clean.substring(0, 3);
  if (clean.length >= 4) formatted += ' ' + clean.substring(3, 6);
  if (clean.length >= 7) formatted += ' ' + clean.substring(6, 8);
  if (clean.length >= 9) formatted += ' ' + clean.substring(8, 10);
  
  return formatted;
};
