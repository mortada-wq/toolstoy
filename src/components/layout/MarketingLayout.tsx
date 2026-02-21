import { Outlet } from 'react-router-dom'
import { Navbar } from '../Navbar'
import { Footer } from '../Footer'

export function MarketingLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
