import ConsoleCleanerProvider from '@/components/ConsoleCleanerProvider'
import GameScene from '@/components/game/GameScene'
import { HandControlProvider } from '@/components/vision/HandControlContext'

export default function GamePage() {
  return (
    <ConsoleCleanerProvider>
      <HandControlProvider>
        <div className="w-full h-screen bg-black flex flex-col">
          {/* Game section - full screen */}
          <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 text-white z-10 text-left">
              <h1 className="text-2xl font-bold drop-shadow-lg">Subway Surfers Clone</h1>
              <p className="text-sm opacity-75 mt-1">← → Arrows: Change lanes | ↑ Jump | ESC: Pause</p>
            </div>
            <GameScene />
          </div>
        </div>
      </HandControlProvider>
    </ConsoleCleanerProvider>
  )
}
