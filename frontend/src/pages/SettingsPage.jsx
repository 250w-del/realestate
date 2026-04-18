import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Bell, Shield, Moon, Sun, Globe, Lock, Save, Camera } from 'lucide-react'
import { updateProfile, updatePassword, uploadAvatar } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { resolveMediaUrl } from '../utils/mediaUrl'

const SettingsPage = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const avatarFileRef = useRef(null)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    propertyUpdates: true,
    messageAlerts: true
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const showAvatarUpload = user?.role === 'admin' || user?.role === 'agent'

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be 10MB or smaller')
      return
    }
    avatarFileRef.current = file
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      if (showAvatarUpload && avatarFileRef.current) {
        await dispatch(uploadAvatar(avatarFileRef.current)).unwrap()
        avatarFileRef.current = null
        setAvatarPreview(null)
      }
      await dispatch(
        updateProfile({
          name: profileData.name,
          phone: profileData.phone,
        })
      ).unwrap()
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update profile')
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await dispatch(updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap()
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully!')
    } catch (error) {
      toast.error('Failed to update password')
    }
  }

  const handleNotificationChange = (key, value) => {
    setNotifications({
      ...notifications,
      [key]: value
    })
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-blue-100 mt-1">Manage your account settings and preferences</p>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {showAvatarUpload && (
                      <div className="flex items-center gap-6 pb-4 border-b border-gray-200">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {avatarPreview || user?.avatar ? (
                              <img
                                src={avatarPreview || resolveMediaUrl(user.avatar)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-10 h-10 text-gray-400" />
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                            <Camera className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Profile photo</p>
                          <p className="text-sm text-gray-500">Shown across the platform. JPEG, PNG, GIF or WebP, max 10MB.</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contact support to change your email.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {user?.role === 'agent' && (
                      <p className="text-sm text-gray-600">
                        <Link
                          to={`/agents/${user.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Open agent profile page
                        </Link>
                        {' '}for license, company, and bio.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Push Notifications</h3>
                          <p className="text-sm text-gray-600">Receive browser notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Property Updates</h3>
                          <p className="text-sm text-gray-600">Updates on saved properties</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.propertyUpdates}
                          onChange={(e) => handleNotificationChange('propertyUpdates', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Message Alerts</h3>
                          <p className="text-sm text-gray-600">New message notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.messageAlerts}
                          onChange={(e) => handleNotificationChange('messageAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {darkMode ? <Moon className="w-5 h-5 text-gray-600 mr-3" /> : <Sun className="w-5 h-5 text-gray-600 mr-3" />}
                        <div>
                          <h3 className="font-medium text-gray-900">Dark Mode</h3>
                          <p className="text-sm text-gray-600">Toggle dark theme</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
