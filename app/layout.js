import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "../components/theme-provider"
import { AuthProvider } from "../contexts/auth-context"
import { Toaster } from "../components/ui/toaster"
import AuthGuard from "../components/auth/auth-guard"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata = {
  title: "FlowForge - Manufacturing Management",
  description: "Modern manufacturing management and workflow optimization platform",
  generator: "FlowForge",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <AuthGuard>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              <Toaster />
              <Analytics />
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
