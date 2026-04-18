import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Home,
  Building,
  Heart,
  MessageCircle,
  Calendar,
  Star,
  Settings,
  Users,
  FileText,
  Plus,
  BarChart3,
  LogOut,
  X
} from 'lucide-react'

import { selectSidebarOpen, selectUser, toggleSidebar } from '../../store/store'
import { logout } from '../../store/slices/authSlice'
import { resolveMediaUrl } from '../../utils/mediaUrl'

const Sidebar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  
  const sidebarOpen = useSelector(selectSidebarOpen)
  const user = useSelector(selectUser)

  const handleLogout = () => {
    dispatch(logout())
  }

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true
    return location.pathname.startsWith(path) && path !== '/dashboard'
  }

  const userNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['user', 'agent', 'admin']
    },
    {
      name: 'My Properties',
      href: '/dashboard/properties',
      icon: Building,
      roles: ['agent']
    },
    {
      name: 'Add Property',
      href: '/dashboard/add-property',
      icon: Plus,
      roles: ['agent']
    },
    {
      name: 'Favorites',
      href: '/dashboard/favorites',
      icon: Heart,
      roles: ['user', 'agent', 'admin']
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: MessageCircle,
      roles: ['user', 'agent', 'admin']
    },
    {
      name: 'Viewings',
      href: '/dashboard/viewings',
      icon: Calendar,
      roles: ['user', 'agent']
    },
    {
      name: 'Reviews',
      href: '/dashboard/reviews',
      icon: Star,
      roles: ['agent', 'admin']
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      roles: ['agent', 'admin']
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: FileText,
      roles: ['admin']
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['user', 'agent', 'admin']
    },
  ]

  // Filter navigation based on user role
  const filteredNavigation = userNavigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              RealEstate
            </span>
          </div>
          
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img
                src={resolveMediaUrl(user.avatar)}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => dispatch(toggleSidebar())}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${active
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-5 bg-primary-600 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
