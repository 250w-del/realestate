import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Heart,
  Star,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  User,
  Building,
  Home,
  DollarSign,
  Check,
  LayoutGrid
} from 'lucide-react'
import toast from 'react-hot-toast'

import { 
  getPropertyById, 
  clearCurrentProperty,
  selectCurrentProperty,
  selectPropertyLoading 
} from '../store/slices/propertySlice'
import { 
  addToFavorites, 
  removeFromFavorites,
  selectFavoriteStatus,
  checkFavoriteStatus 
} from '../store/slices/favoriteSlice'
import { selectIsAuthenticated } from '../store/store'
import { resolveMediaUrl } from '../utils/mediaUrl'

const PropertyDetailsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  
  const property = useSelector(selectCurrentProperty)
  const isLoading = useSelector(selectPropertyLoading)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const favoriteStatus = useSelector(selectFavoriteStatus)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  useEffect(() => {
    if (id) {
      dispatch(getPropertyById(id))
      if (isAuthenticated) {
        dispatch(checkFavoriteStatus(id))
      }
    }

    return () => {
      dispatch(clearCurrentProperty())
    }
  }, [dispatch, id, isAuthenticated])

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to favorites')
      navigate('/login')
      return
    }

    try {
      const isFavorited = favoriteStatus[id]
      if (isFavorited) {
        await dispatch(removeFromFavorites(id)).unwrap()
        toast.success('Removed from favorites')
      } else {
        await dispatch(addToFavorites(id)).unwrap()
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update favorites')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    // This would integrate with the messaging system
    toast.success('Message sent successfully!')
    setShowContactForm(false)
    setContactForm({ name: '', email: '', phone: '', message: '' })
  }

  const handleImageNavigation = (direction) => {
    if (!property?.images?.length) return

    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  const ImageGallery = () => {
    if (!property?.images?.length) {
      return (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Building className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No images available</p>
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <img
            src={resolveMediaUrl(property.images[currentImageIndex].image_url)}
            alt={property.images[currentImageIndex].alt_text || property.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Arrows */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={() => handleImageNavigation('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleImageNavigation('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-white w-8'
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            type="button"
            onClick={() => setShowAllPhotosModal(true)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            title="View all photos"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  const ThumbnailGallery = () => {
    if (!property?.images?.length || property.images.length <= 1) return null

    return (
      <div className="flex space-x-2 mt-4 overflow-x-auto">
        {property.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentImageIndex
                ? 'border-primary-600'
                : 'border-transparent'
            }`}
          >
            <img
              src={resolveMediaUrl(image.image_url)}
              alt={image.alt_text || property.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="skeleton skeleton-card h-96 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="skeleton skeleton-card h-32" />
                <div className="skeleton skeleton-card h-48" />
                <div className="skeleton skeleton-card h-64" />
              </div>
              <div className="space-y-6">
                <div className="skeleton skeleton-card h-48" />
                <div className="skeleton skeleton-card h-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Property Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/properties')}
            className="btn btn-primary"
          >
            Browse Properties
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-6xl max-h-screen p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
              
              <img
                src={resolveMediaUrl(property.images[currentImageIndex]?.image_url)}
                alt={property.title}
                className="max-w-full max-h-full object-contain"
              />
              
              {property.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All photos — grid library */}
      <AnimatePresence>
        {showAllPhotosModal && property?.images?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="All property photos"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
              <h2 className="text-white text-lg font-semibold">
                All photos ({property.images.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowAllPhotosModal(false)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-7xl mx-auto pb-12">
              {property.images.map((image, index) => (
                <button
                  key={image.id ?? index}
                  type="button"
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setShowAllPhotosModal(false)
                    setShowImageModal(true)
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <img
                    src={resolveMediaUrl(image.image_url)}
                    alt={image.alt_text || property.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <button
            onClick={() => navigate('/properties')}
            className="hover:text-primary-600 dark:hover:text-primary-400"
          >
            Properties
          </button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{property.title}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <span className={`status-badge status-${property.status}`}>
                {property.status === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              <span className="badge badge-secondary">
                {property.property_type}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {property.title}
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{property.location}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={handleFavorite}
              className={`p-3 rounded-lg border transition-colors ${
                favoriteStatus[id]
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  : 'bg-white border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Heart className={`w-5 h-5 ${favoriteStatus[id] ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price and Key Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="price text-3xl lg:text-4xl mb-2">
                ${property.price.toLocaleString()}
                <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                  {property.status === 'rent' ? '/month' : ''}
                </span>
              </div>
              
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                {property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Square className="w-5 h-5 mr-2" />
                  <span>{property.size} {property.size_unit || 'sqft'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{property.average_rating || '4.5'}</span>
                  <span>({property.reviews_count || 0} reviews)</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {property.views_count || 0} views
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div>
              <ImageGallery />
              <ThumbnailGallery />
              {property?.images?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllPhotosModal(true)}
                  className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-4 h-4" />
                  View all {property.images.length} photos
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'description', 'features', 'location'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Property Overview
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Property Type</p>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {property.property_type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${property.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {property.year_built && (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Year Built</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {property.year_built}
                              </p>
                            </div>
                          </div>
                        )}

                        {property.parking_spaces > 0 && (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                              <div className="w-5 h-5 text-primary-600 dark:text-primary-400 font-bold">P</div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Parking</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {property.parking_spaces} spaces
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Amenities
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {JSON.parse(property.amenities).map((amenity, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'description' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Description
                    </h3>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {property.description}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Features & Highlights
                    </h3>
                    {property.features && property.features.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {JSON.parse(property.features).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No specific features listed for this property.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'location' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Location
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {property.location}
                          </p>
                          {property.latitude && property.longitude && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Coordinates: {property.latitude}, {property.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Map placeholder */}
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Interactive map coming soon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Agent & Contact */}
          <div className="space-y-8">
            {/* Agent Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Listed by
              </h3>
              
              <div className="flex items-center space-x-4 mb-4">
                {property.agent?.avatar ? (
                  <img
                    src={resolveMediaUrl(property.agent.avatar)}
                    alt={property.agent.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {property.agent?.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real Estate Agent
                  </p>
                  {property.agent?.company && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {property.agent.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {property.agent?.phone && (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{property.agent.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{property.agent?.email}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="btn btn-primary w-full"
                >
                  Contact Agent
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="btn btn-outline w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Viewing
                </button>
                
                <button className="btn btn-outline w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Agent
                </button>
                
                <button className="btn btn-outline w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Property
                </button>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Property Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {property.views_count || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Favorites</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {property.favorites_count || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reviews</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {property.reviews_count || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Listed</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Agent
                </h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="form-input"
                    rows={4}
                    placeholder="I'm interested in this property..."
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PropertyDetailsPage
