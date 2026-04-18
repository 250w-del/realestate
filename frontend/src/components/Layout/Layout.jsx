import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

import { getMe } from '../../store/slices/authSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector(state => state.ui)
  const { isAuthenticated, user, token } = useSelector(state => state.auth)

  useEffect(() => {
    // Ensure user is loaded after refresh when only token is present
    if (isAuthenticated && token && !user) {
      dispatch(getMe())
    }
  }, [dispatch, isAuthenticated, token, user])

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <Header />
        
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default Layout
