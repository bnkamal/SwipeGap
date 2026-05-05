import { DM_Sans, DM_Serif_Display } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
})

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SwipeGap — Swipe Your Gap. Ace Your Exam.',
  description: 'AI-powered micro-tutoring platform for K-12 students in Australia and India. Identify your knowledge gaps and connect with expert mentors.',
  manifest: '/manifest.json',
  themeColor: '#1A4D8F',
  openGraph: {
    title: 'SwipeGap',
    description: 'Swipe Your Gap. Ace Your Exam.',
    url: 'https://swipegap.com',
    siteName: 'SwipeGap',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className=`font-sans antialiased bg-gray-50 text-gray-900 ${dmSans.variable} ${dmSerif.variable}`>
        {children}
      </body>
    </html>
  )
}
