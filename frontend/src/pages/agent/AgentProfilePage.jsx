import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateProfile, uploadAvatar } from '../../store/slices/authSlice'
import { resolveMediaUrl } from '../../utils/mediaUrl'

const AgentProfilePage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const isLoading = useSelector((state) => state.auth.isLoading)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const avatarFileRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const isOwnProfile =
    user && id != null && String(user.id) === String(id)
  const canEdit =
    isOwnProfile && (user.role === 'agent' || user.role === 'admin')

  useEffect(() => {
    if (!user || !canEdit) return
    setValue('name', user.name || '')
    setValue('email', user.email || '')
    setValue('phone', user.phone || '')
    setValue('bio', user.bio || '')
    setValue('license', user.license || '')
    setValue('company', user.company || '')
  }, [user, canEdit, setValue])

  const handleImageChange = (e) => {
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

  const onSubmit = async (data) => {
    if (!canEdit) return
    try {
      if (avatarFileRef.current) {
        await dispatch(uploadAvatar(avatarFileRef.current)).unwrap()
        avatarFileRef.current = null
        setAvatarPreview(null)
      }
      await dispatch(
        updateProfile({
          name: data.name,
          phone: data.phone,
          bio: data.bio || '',
          company: data.company || '',
          license: data.license || '',
        })
      ).unwrap()
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to update profile')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Sign in to view this profile.</p>
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  if (!isOwnProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-4">
            This page is for editing your own profile. The link may be for a different user.
          </p>
          <Link to="/dashboard" className="text-primary-600 font-medium hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-700">Only agents and admins can use this profile editor.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Agent profile</h1>
            <p className="text-blue-100 mt-1">Photo, contact details, and professional info</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {avatarPreview || user?.avatar ? (
                    <img
                      src={avatarPreview || resolveMediaUrl(user.avatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profile picture</h3>
                <p className="text-sm text-gray-500">JPEG, PNG, GIF or WebP. Up to 10MB.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name *</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  disabled
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License number</label>
                <input
                  type="text"
                  {...register('license')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Real estate license"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company / agency</label>
                <input
                  type="text"
                  {...register('company')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Agency name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell clients about your experience"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}

export default AgentProfilePage
