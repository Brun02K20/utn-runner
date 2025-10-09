import ConsoleCleanerProvider from '@/components/ConsoleCleanerProvider'
import GameScene from '@/components/game/GameScene'
import { HandControlProvider } from '@/components/vision/HandControlContext'
import Image from 'next/image'
// a
export default function GamePage() {
  return (
    <ConsoleCleanerProvider>
      <HandControlProvider>
        <div className="w-full h-screen bg-black flex flex-col">
          {/* Game section - full screen */}
          <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 text-white z-10 text-left flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Image src="/utn-2.svg" alt="UTN" width={28} height={28} />
                <h1 className="text-2xl arcade-title drop-shadow-lg">UTN RUNNER</h1>
              </div>
              <p className="text-xs arcade-text opacity-75 mt-2">← → ARROWS: CHANGE LANES | ↑ JUMP | ESC: PAUSE</p>
            </div>
            <GameScene />
          </div>
        </div>
      </HandControlProvider>
    </ConsoleCleanerProvider>
  )
}
