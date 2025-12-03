import React from 'react';
import { GameCanvas } from './components/GameCanvas';

const App: React.FC = () => {
  return (
    // 1. Use 'fixed inset-0' and 'h-[100dvh]' to strictly fill the mobile viewport, ignoring browser bars.
    // 2. 'flex items-center justify-center' centers the game on desktop.
    <div className="fixed inset-0 w-full h-[100dvh] bg-neutral-900 flex items-center justify-center p-0 sm:p-4 overflow-hidden touch-none">
      {/* 
        Game Container:
        - Mobile: w-full h-full (Strictly fills the parent container)
        - Desktop (sm+): Reverts to a "Phone Simulator" look with fixed aspect ratio/max-dimensions
      */}
      <div className="relative w-full h-full sm:w-auto sm:h-auto sm:max-w-[420px] sm:aspect-[9/19] sm:max-h-[850px] bg-white sm:rounded-2xl overflow-hidden shadow-2xl sm:ring-8 ring-neutral-800">
        <GameCanvas />
      </div>
    </div>
  );
};

export default App;