import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider, useStore } from './hooks/useStore';
import HomeScreen from './components/HomeScreen';
import LevelSelectScreen from './components/LevelSelectScreen';
import GameScreen from './components/GameScreen';
import Modals from './components/Modals';

function AppContent() {
  const { state } = useStore();

  return (
    <div className="w-full h-full min-h-screen bg-[#edf2f7] flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {state.screen === 'home' && (
          <motion.div
            key="home"
            className="w-full h-full min-h-screen flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomeScreen />
          </motion.div>
        )}
        {state.screen === 'levels' && (
          <motion.div
            key="levels"
            className="w-full h-full min-h-screen flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LevelSelectScreen />
          </motion.div>
        )}
        {state.screen === 'game' && (
          <motion.div
            key="game"
            className="w-full h-full min-h-screen flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GameScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <Modals />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
