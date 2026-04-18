import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Home,
  Heart,
  MessageCircle,
  Calendar,
  Search,
  TrendingUp,
  User,
  Settings,
  Bell,
  Eye,
  Clock,
  MapPin
} from 'lucide-react'

import { 
  getMe, 
  selectUser 
} from '../../store/slices/authSlice'
import { 
  fetchFavorites, 
  selectFavorites,
  selectFavoriteLoading 
} from '../../store/slices/favoriteSlice'
import { 
  getUnreadCount, 
  selectUnreadCount 
} from '../../store/slices/messageSlice'

const UserDashboard = () => {
  const dispatch = useDispatch()
  
  const user = useSelector(selectUser)
  const favorites = useSelector(selectFavorites)
  const favoriteLoading = useSelector(selectFavoriteLoading)
  const unreadCount = useSelector(selectUnreadCount)

  const [stats, setStats] = useState({
    totalViews: 0,
    totalSaved: 0,
    totalInquiries: 0,
    totalViewings: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [recommendedProperties, setRecommendedProperties] = useState([])

  useEffect(() => {
    dispatch(getMe())
    dispatch(fetchFavorites({ limit: 5 }))
    dispatch(getUnreadCount())
    
    // Mock data - in real app, these would come from API
    setStats({
      totalViews: 156,
      totalSaved: favorites.length || 12,
      totalInquiries: 8,
      totalViewings: 3
    })

    setRecentActivity([
      {
        id: 1,
        type: 'viewed',
        property: 'Modern Downtown Apartment',
        time: '2 hours ago',
        icon: Eye,
        color: 'text-blue-500'
      },
      {
        id: 2,
        type: 'saved',
        property: 'Luxury Villa with Pool',
        time: '5 hours ago',
        icon: Heart,
        color: 'text-red-500'
      },
      {
        id: 3,
        type: 'inquiry',
        property: 'Cozy Suburban House',
        time: '1 day ago',
        icon: MessageCircle,
        color: 'text-green-500'
      },
      {
        id: 4,
        type: 'viewing',
        property: 'Beachfront Condo',
        time: '2 days ago',
        icon: Calendar,
        color: 'text-purple-500'
      }
    ])

    setRecommendedProperties([
      {
        id: 1,
        title: 'Modern Downtown Apartment',
        price: 450000,
        location: 'Downtown, City',
        bedrooms: 2,
        bathrooms: 2,
        size: 1200,
        image: null,
        views: 234
      },
      {
        id: 2,
        title: 'Luxury Villa with Pool',
        price: 1250000,
        location: 'Beverly Hills',
        bedrooms: 5,
        bathrooms: 4,
        size: 4500,
        image: null,
        views: 567
      },
      {
        id: 3,
        title: 'Cozy Suburban House',
        price: 350000,
        location: 'Suburbs',
        bedrooms: 3,
        bathrooms: 2,
        size: 1800,
        image: null,
        views: 123
      }
    ])
  }, [dispatch, favorites.length])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <motion.div variants={itemVariants} className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon
    return (
      <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className={`w-10 h-10 ${activity.color} bg-opacity-10 rounded-full flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activity.type === 'viewed' && 'Viewed '}
            {activity.type === 'saved' && 'Saved '}
            {activity.type === 'inquiry' && 'Sent inquiry about '}
            {activity.type === 'viewing' && 'Scheduled viewing for '}
            {activity.property}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
        </div>
      </div>
    )
  }

  const RecommendedPropertyCard = ({ property }) => (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className="flex space-x-4">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Home className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
            {property.title}
          </h4>
          <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-1">
            ${property.price.toLocaleString()}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
            <span>{property.bedrooms} bed</span>
            <span>{property.bathrooms} bath</span>
            <span>{property.size} sqft</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Eye className="w-3 h-3 mr-1" />
              <span>{property.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-8">
        {/* Welcome Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's what's happening with your property search today.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button className="btn btn-outline flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button className="btn btn-outline flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={Eye}
            title="Properties Viewed"
            value={stats.totalViews}
            color="bg-blue-500"
            trend="+12% this week"
          />
          <StatCard
            icon={Heart}
            title="Saved Properties"
            value={stats.totalSaved}
            color="bg-red-500"
            trend="+3 new"
          />
          <StatCard
            icon={MessageCircle}
            title="Inquiries Sent"
            value={stats.totalInquiries}
            color="bg-green-500"
            trend="+2 this week"
          />
          <StatCard
            icon={Calendar}
            title="Viewings Scheduled"
            value={stats.totalViewings}
            color="bg-purple-500"
            trend="1 upcoming"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                  View All
                </button>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  <button className="btn btn-outline flex items-center justify-center">
                    <Search className="w-4 h-4 mr-2" />
                    Search Properties
                  </button>
                  <button className="btn btn-outline flex items-center justify-center">
                    <Heart className="w-4 h-4 mr-2" />
                    View Favorites
                  </button>
                  <button className="btn btn-outline flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button className="btn btn-outline flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Viewing
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Summary
                  </h3>
                </div>
                <div className="card-body">
                  <div className="flex items-center space-x-4 mb-4">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {user?.name || 'User'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mt-1">
                        {user?.role || 'user'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Member since</span>
                      <span className="text-gray-900 dark:text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Profile status</span>
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Favorites */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Favorites
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                    View All
                  </button>
                </div>
                <div className="card-body">
                  {favoriteLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex space-x-3">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="space-y-3">
                      {favorites.slice(0, 3).map((favorite) => (
                        <div key={favorite.id} className="flex space-x-3">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                              {favorite.property?.title || 'Property'}
                            </h4>
                            <p className="text-primary-600 dark:text-primary-400 text-sm">
                              ${favorite.property?.price?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {favorite.property?.location || 'Location'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No favorites yet
                      </p>
                      <button className="btn btn-primary btn-sm mt-3">
                        Browse Properties
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recommended Properties */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recommended for You
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {recommendedProperties.map((property) => (
                      <RecommendedPropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
