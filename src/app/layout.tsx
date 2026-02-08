import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import AppShell from "@/components/AppShell"

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
      <body className={`${inter.className} bg-[#030303] text-[#D7DADC] antialiased`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
