import React from 'react';
import Level1 from './Level1';
import Level2 from './Level2';
import Level3 from './Level3';
import Level4 from './Level4';
import Level5 from './Level5';
import Level6 from './Level6';
import Level7 from './Level7';
import Level8 from './Level8';
import Level9 from './Level9';
import Level10 from './Level10';
import Level11 from './Level11';
import Level12 from './Level12';
import Level14 from './Level14';
import Level15 from './Level15';
import Level16 from './Level16';
import Level18 from './Level18';
import Level19 from './Level19';
import Level20 from './Level20';
import Level21 from './Level21';
import Level22 from './Level22';

export { Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10, Level11, Level12, Level14, Level15, Level16, Level18, Level19, Level20, Level21, Level22 };

// Helper to get custom level component if available
export const LEVEL_COMPONENTS: Record<number, React.ComponentType> = {
  1: Level1,
  2: Level2,
  3: Level3,
  4: Level4,
  5: Level5,
  6: Level6,
  7: Level7,
  8: Level8,
  9: Level9,
  10: Level10,
  11: Level11,
  12: Level12,
  14: Level14,
  15: Level15,
  16: Level16,
  18: Level18,
  19: Level19,
  20: Level20,
  21: Level21,
  22: Level22,
};

export function getCustomLevel(levelId: number): React.ComponentType | null {
  return LEVEL_COMPONENTS[levelId] || null;
}

