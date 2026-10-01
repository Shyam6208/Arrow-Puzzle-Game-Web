import React from 'react';
import Level1 from './Level1';
import Level2 from './Level2';

export { Level1, Level2 };

// Helper to get custom level component if available
export const LEVEL_COMPONENTS: Record<number, React.ComponentType> = {
  1: Level1,
  2: Level2,
};

export function getCustomLevel(levelId: number): React.ComponentType | null {
  return LEVEL_COMPONENTS[levelId] || null;
}
