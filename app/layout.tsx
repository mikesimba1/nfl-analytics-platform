import './globals.css'
import React from 'react'

const inter = { className: 'font-sans' }

export const metadata = {
  title: 'NFL Analytics Platform',
  description: 'Professional NFL Analytics with Real Data - Player Props, Game Analysis, and More',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {children}
        </div>
      </body>
    </html>
  )
} 