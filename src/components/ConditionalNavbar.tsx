'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ConditionalNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  return (
    <>
      {!isAdmin && <Navbar />}
      <div className={isAdmin ? '' : 'min-h-screen'}>{children}</div>
      {!isAdmin && <Footer />}
    </>
  )
}
