// Display status values for request status mapping
export const DisplayStatus = {
  Closed: 'Closed',
  OnGoingL2: 'On going in L2',
  OnGoingL3: 'On going in L3',
  InL3Backlog: 'In L3 Backlog',
} as const;

export type DisplayStatusValue = (typeof DisplayStatus)[keyof typeof DisplayStatus];

// Default status for unmapped values
export const DEFAULT_DISPLAY_STATUS = DisplayStatus.InL3Backlog;
