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
import Level23 from './Level23';
import Level24 from './Level24';
import Level25 from './Level25';
import Level26 from './Level26';
import Level27 from './Level27';
import Level28 from './Level28';
import Level29 from './Level29';
import Level30 from './Level30';
import Level31 from './Level31';
import Level32 from './Level32';
import Level33 from './Level33';
import Level34 from './Level34';
import Level35 from './Level35';
import Level36 from './Level36';
import Level37 from './Level37';
import Level38 from './Level38';
import Level39 from './Level39';
import Level40 from './Level40';
import Level41 from './Level41';
import Level42 from './Level42';
import Level43 from './Level43';
import Level44 from './Level44';
import Level45 from './Level45';
import Level46 from './Level46';
import Level47 from './Level47';
import Level48 from './Level48';
import Level49 from './Level49';
import Level50 from './Level50';
import Level51 from './Level51';
import Level52 from './Level52';
import Level53 from './Level53';
import Level54 from './Level54';
import Level55 from './Level55';

export { Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10, Level11, Level12, Level14, Level15, Level16, Level18, Level19, Level20, Level21, Level22, Level23, Level24, Level25, Level26, Level27, Level28, Level29, Level30, Level31, Level32, Level33, Level34, Level35, Level36, Level37, Level38, Level39, Level40, Level41, Level42, Level43, Level44, Level45, Level46, Level47, Level48, Level49, Level50, Level51, Level52, Level53, Level54, Level55 };

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
  23: Level23,
  24: Level24,
  25: Level25,
  26: Level26,
  27: Level27,
  28: Level28,
  29: Level29,
  30: Level30,
  31: Level31,
  32: Level32,
  33: Level33,
  34: Level34,
  35: Level35,
  36: Level36,
  37: Level37,
  38: Level38,
  39: Level39,
  40: Level40,
  41: Level41,
  42: Level42,
  43: Level43,
  44: Level44,
  45: Level45,
  46: Level46,
  47: Level47,
  48: Level48,
  49: Level49,
  50: Level50,
  51: Level51,
  52: Level52,
  53: Level53,
  54: Level54,
  55: Level55,
};

export function getCustomLevel(levelId: number): React.ComponentType | null {
  return LEVEL_COMPONENTS[levelId] || null;
}

