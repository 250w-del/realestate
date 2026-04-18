import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Grid,
  List,
  Map,
  SlidersHorizontal,
  X,
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Star,
  ChevronDown,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { resolveMediaUrl, getPropertyCoverUrl } from '../utils/mediaUrl'

import { 
  fetchProperties, 
  updateSearchFilters, 
  selectProperties, 
  selectPagination, 
  selectPropertyLoading, 
  selectSearchFilters 
} from '../store/slices/propertySlice'
import { 
  addToFavorites, 
  removeFromFavorites, 
  selectFavoriteStatus 
} from '../store/slices/favoriteSlice'
import { setPropertyView, selectPropertyView } from '../store/slices/uiSlice'

const PropertyListingPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const properties = useSelector(selectProperties)
  const pagination = useSelector(selectPagination)
  const isLoading = useSelector(selectPropertyLoading)
  const searchFilters = useSelector(selectSearchFilters)
  const propertyView = useSelector(selectPropertyView)
  const favoriteStatus = useSelector(selectFavoriteStatus)

  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState({})
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')

  useEffect(() => {
    // Initialize filters from URL params
    const params = Object.fromEntries(searchParams.entries())
    setLocalFilters(params)
    dispatch(updateSearchFilters(params))
  }, [searchParams, dispatch])

  useEffect(() => {
    // Fetch properties when filters change
    const fetchParams = {
      ...searchFilters,
      page: pagination.current_page,
      limit: 12,
      sort_by: sortBy,
      sort_order: sortOrder
    }
    dispatch(fetchProperties(fetchParams))
  }, [dispatch, searchFilters, sortBy, sortOrder, pagination.current_page])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    params.set('sort_by', sortBy)
    params.set('sort_order', sortOrder)
    
    setSearchParams(params)
    dispatch(updateSearchFilters(localFilters))
    setShowFilters(false)
  }

  const clearFilters = () => {
    setLocalFilters({})
    setSearchParams({})
    dispatch(updateSearchFilters({}))
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page)
    setSearchParams(params)
  }

  const handleFavorite = async (propertyId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const isFavorited = favoriteStatus[propertyId]
      if (isFavorited) {
        await dispatch(removeFromFavorites(propertyId)).unwrap()
        toast.success('Removed from favorites')
      } else {
        await dispatch(addToFavorites(propertyId)).unwrap()
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update favorites')
    }
  }

  const PropertyCard = ({ property }) => {
    const isFavorited = favoriteStatus[property.id] || false

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="property-card card overflow-hidden group"
      >
        <div className="relative">
          <div className="image-gallery h-48">
            {getPropertyCoverUrl(property) ? (
              <img
                src={getPropertyCoverUrl(property)}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                </div>
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
            onClick={(e) => handleFavorite(property.id, e)}
            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
            />
          </button>

          {/* Property Type Badge */}
          <div className="absolute bottom-2 left-2">
            <span className="badge badge-secondary text-xs">
              {property.property_type}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{property.average_rating || '4.5'}</span>
              {property.reviews_count > 0 && (
                <span className="text-xs">({property.reviews_count})</span>
              )}
            </div>
          </div>

          <p className="price mb-2">
            ${property.price?.toLocaleString()}
            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
              {property.status === 'rent' ? '/month' : ''}
            </span>
          </p>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            {property.bedrooms > 0 && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} bed</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.bathrooms} bath</span>
              </div>
            )}
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.size} {property.size_unit || 'sqft'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {property.agent?.avatar ? (
                <img
                  src={property.agent.avatar}
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
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {property.views_count || 0} views
              </span>
              {property.favorites_count > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Heart className="w-3 h-3" />
                  <span>{property.favorites_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const PropertyListItem = ({ property }) => {
    const isFavorited = favoriteStatus[property.id] || false

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card p-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Image */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="relative image-gallery h-48 lg:h-32 rounded-lg overflow-hidden">
              {getPropertyCoverUrl(property) ? (
                <img
                  src={getPropertyCoverUrl(property)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              
              <div className="absolute top-2 left-2">
                <span className={`status-badge status-${property.status}`}>
                  {property.status === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
              </div>

              <button
                onClick={(e) => handleFavorite(property.id, e)}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {property.title}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{property.average_rating || '4.5'}</span>
                </div>
                <span className="price">
                  ${property.price?.toLocaleString()}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                    {property.status === 'rent' ? '/month' : ''}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{property.location}</span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {property.description}
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
              {property.bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms} bed</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms} bath</span>
                </div>
              )}
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{property.size} {property.size_unit || 'sqft'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {property.agent?.avatar ? (
                  <img
                    src={property.agent.avatar}
                    alt={property.agent.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {property.agent?.name}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {property.views_count || 0} views
                </span>
                <button
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Property Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your perfect property from our extensive collection
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by location, property name..."
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(setPropertyView('grid'))}
                className={`p-2 rounded ${propertyView === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(setPropertyView('list'))}
                className={`p-2 rounded ${propertyView === 'list' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(setPropertyView('map'))}
                className={`p-2 rounded ${propertyView === 'map' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setSortBy(sort)
                  setSortOrder(order)
                }}
                className="form-input"
              >
                <option value="created_at-DESC">Newest First</option>
                <option value="created_at-ASC">Oldest First</option>
                <option value="price-ASC">Price: Low to High</option>
                <option value="price-DESC">Price: High to Low</option>
                <option value="size-DESC">Size: Large to Small</option>
                <option value="size-ASC">Size: Small to Large</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {Object.values(localFilters).filter(v => v).length > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 rounded-full text-xs">
                  {Object.values(localFilters).filter(v => v).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Property Type</label>
                  <select
                    value={localFilters.property_type || ''}
                    onChange={(e) => handleFilterChange('property_type', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={localFilters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Bedrooms</label>
                  <select
                    value={localFilters.bedrooms || ''}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Bathrooms</label>
                  <select
                    value={localFilters.bathrooms || ''}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Min Price</label>
                  <input
                    type="number"
                    value={localFilters.min_price || ''}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Max Price</label>
                  <input
                    type="number"
                    value={localFilters.max_price || ''}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    placeholder="1000000"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Min Size</label>
                  <input
                    type="number"
                    value={localFilters.min_size || ''}
                    onChange={(e) => handleFilterChange('min_size', e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Max Size</label>
                  <input
                    type="number"
                    value={localFilters.max_size || ''}
                    onChange={(e) => handleFilterChange('max_size', e.target.value)}
                    placeholder="5000"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost"
                >
                  Clear All Filters
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    className="btn btn-primary"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600 dark:text-gray-400">
            Showing {properties.length} of {pagination.total_items} properties
          </div>
        </div>

        {/* Properties */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <>
            {propertyView === 'grid' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {propertyView === 'list' && (
              <div className="space-y-4">
                {properties.map((property) => (
                  <PropertyListItem key={property.id} property={property} />
                ))}
              </div>
            )}

            {propertyView === 'map' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Map view coming soon! Switch to grid or list view to see properties.
                </p>
              </div>
            )}

            {!isLoading && properties.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search filters or browse all properties.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!isLoading && properties.length > 0 && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                let pageNum
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1
                } else if (pagination.current_page <= 3) {
                  pageNum = i + 1
                } else if (pagination.current_page >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i
                } else {
                  pageNum = pagination.current_page - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === pagination.current_page
                        ? 'bg-primary-600 text-white'
                        : 'btn btn-outline'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyListingPage
