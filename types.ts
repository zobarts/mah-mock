
export interface BlockState {
  isBlocked: boolean;
  blockUntil: number; // Timestamp
  attemptLevel: number; // 0, 1, 2, 3...
  codeFailures: number;
}

export enum AppStep {
  PHONE_INPUT = 'PHONE_INPUT',
  CODE_VERIFICATION = 'CODE_VERIFICATION'
}
