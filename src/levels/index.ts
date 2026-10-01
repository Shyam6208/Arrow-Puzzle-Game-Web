import React from 'react';
import Level1 from './Level1';
import Level2 from './Level2';
import Level3 from './Level3';
import Level4 from './Level4';
import Level5 from './Level5';
import Level6 from './Level6';
import Level7 from './Level7';

export { Level1, Level2, Level3, Level4, Level5, Level6, Level7 };

// Helper to get custom level component if available
export const LEVEL_COMPONENTS: Record<number, React.ComponentType> = {
  1: Level1,
  2: Level2,
  3: Level3,
  4: Level4,
  5: Level5,
  6: Level6,
  7: Level7,
};

export function getCustomLevel(levelId: number): React.ComponentType | null {
  return LEVEL_COMPONENTS[levelId] || null;
}

