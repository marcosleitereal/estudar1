import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Estudar.Pro - Plataforma de Estudos Jurídicos',
  description: 'Plataforma completa para estudos jurídicos com lei seca, súmulas, jurisprudência, flashcards e simulados.',
  keywords: 'direito, estudos jurídicos, lei seca, súmulas, jurisprudência, flashcards, simulados',
  authors: [{ name: 'Estudar.Pro' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
