import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Heart, Home, MapPin, Bed, Bath, Square, DollarSign, Trash2 } from 'lucide-react'
import { fetchFavorites, removeFromFavorites } from '../store/slices/favoriteSlice'
import toast from 'react-hot-toast'

const FavoritesPage = () => {
  const dispatch = useDispatch()
  const { favorites, loading } = useSelector(state => state.favorites)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchFavorites())
  }, [dispatch])

  const filteredFavorites = favorites.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRemoveFromFavorites = async (propertyId) => {
    try {
      await dispatch(removeFromFavorites(propertyId)).unwrap()
      toast.success('Removed from favorites')
    } catch (error) {
      toast.error('Failed to remove from favorites')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorite Properties</h1>
          <p className="text-gray-600">Properties you've saved for later</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Start exploring and save properties you love!</p>
            <a
              href="/properties"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Properties
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={property.images?.[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromFavorites(property.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-sm font-semibold text-blue-600">
                    ${property.price.toLocaleString()}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      <span>{property.area} sqft</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {property.status}
                    </span>
                    <a
                      href={`/properties/${property.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default FavoritesPage
