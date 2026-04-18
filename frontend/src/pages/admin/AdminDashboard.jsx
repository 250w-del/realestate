import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Users,
  Building,
  Eye,
  MessageCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  UserCheck,
  UserX,
  Home,
  Star,
  Calendar,
  Shield
} from 'lucide-react'

import { 
  getMe, 
  selectUser 
} from '../../store/slices/authSlice'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  
  const user = useSelector(selectUser)

  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalAgents: 89,
    verifiedAgents: 67,
    totalProperties: 456,
    activeProperties: 389,
    totalViews: 125420,
    totalInquiries: 1234,
    totalRevenue: 1245000,
    pendingApprovals: 12,
    reportedIssues: 3
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [pendingAgents, setPendingAgents] = useState([])
  const [systemHealth, setSystemHealth] = useState({})
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    // Mock data - in real app, these would come from API
    setStats({
      totalUsers: 1247,
      totalAgents: 89,
      verifiedAgents: 67,
      totalProperties: 456,
      activeProperties: 389,
      totalViews: 125420,
      totalInquiries: 1234,
      totalRevenue: 1245000,
      pendingApprovals: 12,
      reportedIssues: 3
    })

    setRecentActivity([
      {
        id: 1,
        type: 'user_registered',
        user: 'John Doe',
        role: 'user',
        time: '5 minutes ago',
        status: 'info'
      },
      {
        id: 2,
        type: 'agent_verification',
        user: 'Sarah Smith',
        role: 'agent',
        time: '15 minutes ago',
        status: 'warning'
      },
      {
        id: 3,
        type: 'property_added',
        user: 'Mike Johnson',
        property: 'Luxury Downtown Condo',
        time: '1 hour ago',
        status: 'success'
      },
      {
        id: 4,
        type: 'issue_reported',
        user: 'Anonymous',
        issue: 'Property listing violation',
        time: '2 hours ago',
        status: 'error'
      },
      {
        id: 5,
        type: 'payment_received',
        user: 'Premium Agent',
        amount: '$299',
        time: '3 hours ago',
        status: 'success'
      }
    ])

    setPendingAgents([
      {
        id: 1,
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        phone: '+1-555-0123',
        company: 'Smith Realty',
        license: 'RE123456',
        registeredAt: '2024-01-10',
        experience: '5 years'
      },
      {
        id: 2,
        name: 'David Wilson',
        email: 'david@example.com',
        phone: '+1-555-0124',
        company: 'Wilson Properties',
        license: 'RE789012',
        registeredAt: '2024-01-09',
        experience: '3 years'
      },
      {
        id: 3,
        name: 'Emily Brown',
        email: 'emily@example.com',
        phone: '+1-555-0125',
        company: 'Brown Real Estate',
        license: 'RE345678',
        registeredAt: '2024-01-08',
        experience: '7 years'
      }
    ])

    setSystemHealth({
      serverUptime: '99.9%',
      responseTime: '245ms',
      errorRate: '0.1%',
      activeConnections: 1247,
      databaseStatus: 'healthy',
      storageUsage: '67%',
      lastBackup: '2 hours ago'
    })

    setRevenueData([
      { month: 'Jan', revenue: 85000, users: 980, properties: 320 },
      { month: 'Feb', revenue: 92000, users: 1050, properties: 345 },
      { month: 'Mar', revenue: 98000, users: 1120, properties: 378 },
      { month: 'Apr', revenue: 105000, users: 1180, properties: 402 },
      { month: 'May', revenue: 112000, users: 1210, properties: 425 },
      { month: 'Jun', revenue: 124500, users: 1247, properties: 456 }
    ])
  }, [dispatch])

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

  const StatCard = ({ icon: Icon, title, value, color, trend, subtitle, change }) => (
    <motion.div variants={itemVariants} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            change > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
            <span>{Math.abs(change)}%</span>
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
        case 'user_registered':
          return <Users className="w-4 h-4" />
        case 'agent_verification':
          return <UserCheck className="w-4 h-4" />
        case 'property_added':
          return <Building className="w-4 h-4" />
        case 'issue_reported':
          return <AlertTriangle className="w-4 h-4" />
        case 'payment_received':
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
        case 'error':
          return 'text-red-500 bg-red-50 dark:bg-red-900/20'
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
            {activity.type === 'user_registered' && 'New user registered: '}
            {activity.type === 'agent_verification' && 'Agent verification requested: '}
            {activity.type === 'property_added' && 'New property added by '}
            {activity.type === 'issue_reported' && 'Issue reported: '}
            {activity.type === 'payment_received' && 'Payment received from '}
            {activity.user}
            {activity.property && ` - ${activity.property}`}
            {activity.issue && ` - ${activity.issue}`}
            {activity.amount && ` - ${activity.amount}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
        </div>
      </div>
    )
  }

  const AgentApprovalItem = ({ agent }) => (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{agent.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {agent.company} • {agent.experience} experience
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-success btn-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approve
          </button>
          <button className="btn btn-danger btn-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Reject
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">License:</span>
          <span className="ml-2 text-gray-900 dark:text-white">{agent.license}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Phone:</span>
          <span className="ml-2 text-gray-900 dark:text-white">{agent.phone}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Registered:</span>
          <span className="ml-2 text-gray-900 dark:text-white">{agent.registeredAt}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Status:</span>
          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs">
            Pending
          </span>
        </div>
      </div>
    </div>
  )

  const SystemHealthItem = ({ label, value, status }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
        <div className={`w-2 h-2 rounded-full ${
          status === 'healthy' ? 'bg-green-500' :
          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                System overview and management controls
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  System Healthy
                </span>
              </div>
              <button className="btn btn-outline flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </motion.div>

        {/* Alert Cards */}
        {(stats.pendingApprovals > 0 || stats.reportedIssues > 0) && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {stats.pendingApprovals > 0 && (
              <motion.div variants={itemVariants} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      {stats.pendingApprovals} pending agent approvals
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Review and verify new agent applications
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {stats.reportedIssues > 0 && (
              <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {stats.reportedIssues} reported issues
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Address user reports and violations
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            color="bg-blue-500"
            change={5.2}
            subtitle={`${stats.totalAgents} agents`}
          />
          <StatCard
            icon={Building}
            title="Properties"
            value={stats.totalProperties.toLocaleString()}
            color="bg-green-500"
            change={8.7}
            subtitle={`${stats.activeProperties} active`}
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            color="bg-purple-500"
            change={12.3}
            subtitle="This month"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            color="bg-orange-500"
            change={15.8}
            subtitle="This month"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Agent Approvals */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pending Agent Approvals
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                    View All ({stats.pendingApprovals})
                  </button>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {pendingAgents.slice(0, 3).map((agent) => (
                      <AgentApprovalItem key={agent.id} agent={agent} />
                    ))}
                  </div>
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

            {/* Revenue Chart */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Revenue Overview
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                    View Details
                  </button>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {revenueData.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {month.month}
                        </span>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ${month.revenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">revenue</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {month.users}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">users</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {month.properties}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">properties</p>
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
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* System Health */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Health
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <SystemHealthItem
                      label="Server Uptime"
                      value={systemHealth.serverUptime}
                      status="healthy"
                    />
                    <SystemHealthItem
                      label="Response Time"
                      value={systemHealth.responseTime}
                      status="healthy"
                    />
                    <SystemHealthItem
                      label="Error Rate"
                      value={systemHealth.errorRate}
                      status="healthy"
                    />
                    <SystemHealthItem
                      label="Active Connections"
                      value={systemHealth.activeConnections}
                      status="healthy"
                    />
                    <SystemHealthItem
                      label="Database Status"
                      value={systemHealth.databaseStatus}
                      status="healthy"
                    />
                    <SystemHealthItem
                      label="Storage Usage"
                      value={systemHealth.storageUsage}
                      status="warning"
                    />
                    <SystemHealthItem
                      label="Last Backup"
                      value={systemHealth.lastBackup}
                      status="healthy"
                    />
                  </div>
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
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <Building className="w-4 h-4 mr-2" />
                      Review Properties
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Support Tickets
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Reports
                    </button>
                    <button className="btn btn-outline w-full flex items-center justify-center">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Stats */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Today's Stats
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New Users</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New Properties</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Inquiries</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">$3,450</span>
                    </div>
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

export default AdminDashboard
