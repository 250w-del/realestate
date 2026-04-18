import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Search, 
  Home as HomeIcon, 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Heart,
  Star,
  ArrowRight,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

import { fetchFeaturedProperties } from '../store/slices/propertySlice'
import { selectFeaturedProperties, selectPropertyLoading } from '../store/store'
import { resolveMediaUrl, getPropertyCoverUrl } from '../utils/mediaUrl'

const HomePage = () => {
  const dispatch = useDispatch()
  const featuredProperties = useSelector(selectFeaturedProperties)
  const isLoading = useSelector(selectPropertyLoading)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    property_type: '',
    status: '',
    location: ''
  })

  useEffect(() => {
    dispatch(fetchFeaturedProperties({ limit: 6 }))
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (searchQuery.trim()) params.append('search', searchQuery.trim())
    if (searchFilters.property_type) params.append('property_type', searchFilters.property_type)
    if (searchFilters.status) params.append('status', searchFilters.status)
    if (searchFilters.location) params.append('location', searchFilters.location)

    window.location.href = `/properties?${params.toString()}`
  }

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

  const PropertyCard = ({ property }) => {
    const [isFavorited, setIsFavorited] = useState(false)
    const coverUrl = getPropertyCoverUrl(property)

    const handleFavorite = (e) => {
      e.preventDefault()
      setIsFavorited(!isFavorited)
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
    }

    return (
      <motion.div
        variants={itemVariants}
        className="property-card card overflow-hidden group"
      >
        <div className="relative">
          <div className="image-gallery h-48">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Building className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`status-badge status-${property.status}`}>
              {property.status === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{property.average_rating || '4.5'}</span>
            </div>
          </div>

          <p className="price mb-2">
            ${property.price?.toLocaleString()}
            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
              {property.status === 'rent' ? '/month' : ''}
            </span>
          </p>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            {property.bedrooms > 0 && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.size} {property.size_unit || 'sqft'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {property.agent?.avatar ? (
                <img
                  src={resolveMediaUrl(property.agent.avatar)}
                  alt={property.agent.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {property.agent?.name}
              </span>
            </div>
            <Link
              to={`/properties/${property.id}`}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container py-20 lg:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-bold mb-6"
            >
              Find Your Dream
              <span className="block text-primary-200">Home With Us</span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl lg:text-2xl text-primary-100 mb-8"
            >
              Discover the perfect property from our extensive collection of homes, apartments, and commercial spaces
            </motion.p>

            {/* Search Form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label text-gray-900 dark:text-white">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Location, property name..."
                    className="form-input text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="form-label text-gray-900 dark:text-white">Property Type</label>
                  <select
                    value={searchFilters.property_type}
                    onChange={(e) => setSearchFilters({...searchFilters, property_type: e.target.value})}
                    className="form-input text-gray-900 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label text-gray-900 dark:text-white">Status</label>
                  <select
                    value={searchFilters.status}
                    onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                    className="form-input text-gray-900 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose RealEstate
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide the best real estate experience with cutting-edge technology and exceptional service
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: TrendingUp,
                title: 'Market Insights',
                description: 'Get real-time market data and trends to make informed decisions'
              },
              {
                icon: Users,
                title: 'Expert Agents',
                description: 'Work with verified and experienced real estate professionals'
              },
              {
                icon: Shield,
                title: 'Secure Transactions',
                description: 'Your safety and security are our top priorities'
              },
              {
                icon: HomeIcon,
                title: 'Virtual Tours',
                description: 'Explore properties from the comfort of your home'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover our handpicked selection of premium properties
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="skeleton skeleton-card" />
                  <div className="p-4 space-y-4">
                    <div className="skeleton skeleton-text" />
                    <div className="skeleton skeleton-text" />
                    <div className="skeleton skeleton-text" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </motion.div>
          )}

          {!isLoading && featuredProperties.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No featured properties available at the moment.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              View All Properties
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their perfect property through our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
              >
                Browse Properties
              </Link>
              <Link
                to="/register"
                className="btn bg-primary-700 text-white hover:bg-primary-800 btn-lg"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
