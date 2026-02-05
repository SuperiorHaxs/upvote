import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import BottomNav from "@/components/BottomNav"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "UpVote - Who's Right?",
  description: "Post arguments and let the internet decide who's right",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0F0F0F] text-white antialiased`}>
        <AuthProvider>
          <main className="min-h-screen pb-20">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
