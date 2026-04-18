import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Building,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  TrendingUp,
  Plus,
  Users,
  Star,
  DollarSign,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

import { 
  getMe, 
  selectUser 
} from '../../store/slices/authSlice'
import { 
  fetchPropertiesByAgent,
  selectAgentProperties,
  selectPropertyLoading 
} from '../../store/slices/propertySlice'

const AgentDashboard = () => {
  const dispatch = useDispatch()
  
  const user = useSelector(selectUser)
  const agentProperties = useSelector(selectAgentProperties)
  const propertyLoading = useSelector(selectPropertyLoading)

  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    averageRating: 4.8,
    revenue: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingViewings, setUpcomingViewings] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPropertiesByAgent({ agentId: user.id, params: { limit: 10 } }))
    }
    
    // Mock data - in real app, these would come from API
    setStats({
      totalProperties: 24,
      activeListings: 18,
      totalViews: 15420,
      totalInquiries: 156,
      averageRating: 4.8,
      revenue: 245000
    })

    setRecentActivity([
      {
        id: 1,
        type: 'property_added',
        property: 'Luxury Downtown Condo',
        time: '2 hours ago',
        status: 'success'
      },
      {
        id: 2,
        type: 'inquiry',
        property: 'Modern Suburban House',
        time: '3 hours ago',
        status: 'info'
      },
      {
        id: 3,
        type: 'viewing_scheduled',
        property: 'Beachfront Villa',
        time: '5 hours ago',
        status: 'warning'
      },
      {
        id: 4,
        type: 'property_sold',
        property: 'Cozy Apartment',
        time: '1 day ago',
        status: 'success'
      }
    ])

    setUpcomingViewings([
      {
        id: 1,
        property: 'Modern Downtown Apartment',
        client: 'John Smith',
        date: '2024-01-15',
        time: '10:00 AM',
        status: 'confirmed'
      },
      {
        id: 2,
        property: 'Luxury Villa with Pool',
        client: 'Sarah Johnson',
        date: '2024-01-15',
        time: '2:00 PM',
        status: 'pending'
      },
      {
        id: 3,
        property: 'Cozy Suburban House',
        client: 'Mike Davis',
        date: '2024-01-16',
        time: '11:00 AM',
        status: 'confirmed'
      }
    ])

    setPerformanceData([
      { month: 'Jan', views: 3200, inquiries: 45, sales: 3 },
      { month: 'Feb', views: 3800, inquiries: 52, sales: 4 },
      { month: 'Mar', views: 4100, inquiries: 48, sales: 5 },
      { month: 'Apr', views: 3900, inquiries: 61, sales: 6 },
      { month: 'May', views: 4500, inquiries: 58, sales: 7 },
      { month: 'Jun', views: 4200, inquiries: 65, sales: 8 }
    ])
  }, [dispatch, user?.id])

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

  const StatCard = ({ icon: Icon, title, value, color, trend, subtitle }) => (
    <motion.div variants={itemVariants} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'property_added':
          return <Plus className="w-4 h-4" />
        case 'inquiry':
          return <MessageCircle className="w-4 h-4" />
        case 'viewing_scheduled':
          return <Calendar className="w-4 h-4" />
        case 'property_sold':
          return <DollarSign className="w-4 h-4" />
        default:
          return <FileText className="w-4 h-4" />
      }
    }

    const getStatusColor = () => {
      switch (activity.status) {
        case 'success':
          return 'text-green-500 bg-green-50 dark:bg-green-900/20'
        case 'warning':
          return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        case 'info':
          return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
        default:
          return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
      }
    }

    return (
      <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className={`w-10 h-10 ${getStatusColor()} rounded-full flex items-center justify-center`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activity.type === 'property_added' && 'Added new property: '}
            {activity.type === 'inquiry' && 'New inquiry for: '}
            {activity.type === 'viewing_scheduled' && 'Viewing scheduled for: '}
            {activity.type === 'property_sold' && 'Property sold: '}
            {activity.property}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
        </div>
      </div>
    )
  }

  const ViewingItem = ({ viewing }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${
            viewing.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {viewing.status}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {viewing.date} at {viewing.time}
        </span>
      </div>
      
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
        {viewing.property}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Client: {viewing.client}
      </p>
      
      <div className="flex items-center space-x-2 mt-3">
        <button className="btn btn-outline btn-sm flex-1">
          <MessageCircle className="w-3 h-3 mr-1" />
          Contact
        </button>
        <button className="btn btn-outline btn-sm flex-1">
          <Calendar className="w-3 h-3 mr-1" />
          Reschedule
        </button>
      </div>
    </div>
  )

  const PropertyListItem = ({ property }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`status-badge status-${property.status}`}>
            {property.status === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          <span className="badge badge-secondary text-xs">
            {property.property_type}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{property.views_count || 0}</span>
        </div>
      </div>
      
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
        {property.title}
      </h4>
      <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-2">
        ${property.price?.toLocaleString() || '0'}
      </p>
      
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3 mb-3">
        <span>{property.bedrooms || 0} bed</span>
        <span>{property.bathrooms || 0} bath</span>
        <span>{property.size || 0} sqft</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {property.location}
        </span>
        <div className="flex items-center space-x-1">
          <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
            Edit
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm">
            Delete
          </button>
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
                Agent Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name || 'Agent'}! Here's your business overview.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button className="btn btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </button>
              <button className="btn btn-outline flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          <StatCard
            icon={Building}
            title="Total Properties"
            value={stats.totalProperties}
            color="bg-blue-500"
            trend="+2 this month"
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            color="bg-green-500"
            trend="+12% this week"
          />
          <StatCard
            icon={MessageCircle}
            title="Inquiries"
            value={stats.totalInquiries}
            color="bg-purple-500"
            trend="+8 this week"
          />
          <StatCard
            icon={Calendar}
            title="Viewings"
            value={upcomingViewings.length}
            color="bg-yellow-500"
            subtitle={`${upcomingViewings.filter(v => v.status === 'confirmed').length} confirmed`}
          />
          <StatCard
            icon={Star}
            title="Average Rating"
            value={stats.averageRating}
            color="bg-orange-500"
            subtitle="from 24 reviews"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            color="bg-red-500"
            trend="+18% this month"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Properties */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Properties
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                    View All
                  </button>
                </div>
                <div className="card-body">
                  {propertyLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : agentProperties.length > 0 ? (
                    <div className="space-y-4">
                      {agentProperties.slice(0, 5).map((property) => (
                        <PropertyListItem key={property.id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No properties yet
                      </p>
                      <button className="btn btn-primary mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Property
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
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
            </motion.div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Upcoming Viewings */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upcoming Viewings
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                    View All
                  </button>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {upcomingViewings.map((viewing) => (
                      <ViewingItem key={viewing.id} viewing={viewing} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance Overview */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance Overview
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {performanceData.slice(-3).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {month.month}
                        </span>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {month.views}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">views</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {month.inquiries}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">inquiries</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              {month.sales}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">sales</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="btn btn-outline w-full mt-4">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <button className="btn btn-primary w-full flex items-center justify-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Property
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Clients
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Viewing
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </button>
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

export default AgentDashboard
