import type { Metadata } from 'next'
import {Press_Start_2P} from 'next/font/google'
// removed Geist font usage to enforce single arcade font across the app
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const PressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start-2p',
})

export const metadata: Metadata = {
  title: 'UTN RUNNER',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={PressStart2P.variable}>
      <head />
      <body className={PressStart2P.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
