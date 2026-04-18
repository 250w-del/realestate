import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Building,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  Car,
  Home,
  Plus,
  X,
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

import { 
  createProperty,
  selectPropertyLoading 
} from '../../store/slices/propertySlice'
import { selectUser } from '../../store/slices/authSlice'
import propertyService from '../../services/propertyService'

const AddPropertyPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const isLoading = useSelector(selectPropertyLoading)
  const user = useSelector(selectUser)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    latitude: '',
    longitude: '',
    property_type: 'house',
    status: 'sale',
    bedrooms: '',
    bathrooms: '',
    size: '',
    size_unit: 'sqft',
    year_built: '',
    parking_spaces: '',
    amenities: [],
    features: []
  })
  const [images, setImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [amenityInput, setAmenityInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const totalSteps = 4

  useEffect(() => {
    // Check if user is an agent
    if (user?.role !== 'agent' && user?.role !== 'admin') {
      toast.error('You must be an agent to add properties')
      navigate('/dashboard')
    }
  }, [user, navigate])

  const validateStep = (step) => {
    const errors = {}
    
    if (step === 1) {
      if (!formData.title.trim()) {
        errors.title = 'Title is required'
      } else if (formData.title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters'
      }
      
      if (!formData.description.trim()) {
        errors.description = 'Description is required'
      } else if (formData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters'
      }
      
      if (!formData.price) {
        errors.price = 'Price is required'
      } else if (parseFloat(formData.price) <= 0) {
        errors.price = 'Price must be greater than 0'
      }
      
      if (!formData.location.trim()) {
        errors.location = 'Location is required'
      }
    }
    
    if (step === 2) {
      if (!formData.bedrooms || formData.bedrooms < 0) {
        errors.bedrooms = 'Valid number of bedrooms is required'
      }
      
      if (!formData.bathrooms || formData.bathrooms < 0) {
        errors.bathrooms = 'Valid number of bathrooms is required'
      }
      
      if (!formData.size || parseFloat(formData.size) <= 0) {
        errors.size = 'Valid size is required'
      }
      
      if (formData.year_built && (formData.year_built < 1800 || formData.year_built > new Date().getFullYear())) {
        errors.year_built = 'Please enter a valid year'
      }
    }
    
    if (step === 3) {
      if (images.length === 0) {
        errors.images = 'At least one image is required'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`)
        return false
      }
      return true
    })
    
    const newImages = [...images, ...validFiles]
    const newPreviews = [...previewImages, ...validFiles.map(file => URL.createObjectURL(file))]
    
    setImages(newImages)
    setPreviewImages(newPreviews)
    
    if (validationErrors.images) {
      setValidationErrors(prev => ({
        ...prev,
        images: ''
      }))
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previewImages.filter((_, i) => i !== index)
    
    setImages(newImages)
    setPreviewImages(newPreviews)
  }

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }))
      setAmenityInput('')
    }
  }

  const removeAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }))
      setFeatureInput('')
    }
  }

  const removeFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // On the final step, validate the entire form (steps 1-3)
    if (currentStep === totalSteps) {
      const allValid = [1, 2, 3].every((s) => validateStep(s))
      if (!allValid) return
    } else {
      if (!validateStep(currentStep)) return
    }
    
    // Do not spread formData: empty strings for optional fields fail express-validator
    // (.optional() skips undefined, not "").
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      location: formData.location.trim(),
      property_type: formData.property_type,
      status: formData.status,
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseInt(formData.bathrooms, 10),
      size: parseFloat(formData.size),
      size_unit: formData.size_unit,
      amenities: formData.amenities,
      features: formData.features,
    }

    const yearBuilt = formData.year_built?.toString().trim()
      ? parseInt(formData.year_built, 10)
      : NaN
    if (!Number.isNaN(yearBuilt)) submitData.year_built = yearBuilt

    const parkingRaw = formData.parking_spaces?.toString().trim()
    if (parkingRaw !== '') {
      const parkingSpaces = parseInt(formData.parking_spaces, 10)
      if (!Number.isNaN(parkingSpaces)) submitData.parking_spaces = parkingSpaces
    }

    const latRaw = formData.latitude?.toString().trim()
    if (latRaw !== '') {
      const latitude = parseFloat(formData.latitude)
      if (!Number.isNaN(latitude)) submitData.latitude = latitude
    }

    const lngRaw = formData.longitude?.toString().trim()
    if (lngRaw !== '') {
      const longitude = parseFloat(formData.longitude)
      if (!Number.isNaN(longitude)) submitData.longitude = longitude
    }
    
    try {
      const result = await dispatch(createProperty(submitData)).unwrap()
      const propertyId = result.property?.id
      if (!propertyId) {
        toast.error('Property created but missing id')
        return
      }

      if (images.length > 0) {
        setIsUploadingImages(true)
        const formData = new FormData()
        images.forEach((file) => {
          formData.append('images', file)
        })
        try {
          await propertyService.uploadPropertyImages(propertyId, formData)
        } catch (uploadErr) {
          const msg =
            uploadErr.response?.data?.message ||
            uploadErr.message ||
            'Failed to upload images'
          toast.error(msg)
          setIsUploadingImages(false)
          navigate(`/properties/${propertyId}`)
          return
        }
        setIsUploadingImages(false)
      }

      toast.success('Property added successfully!')
      navigate(`/properties/${propertyId}`)
    } catch (error) {
      toast.error(error || 'Failed to add property')
    }
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

  const StepIndicator = ({ step, title, isActive, isCompleted }) => (
    <div className="flex items-center">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
        ${isCompleted ? 'bg-green-500 text-white' : 
          isActive ? 'bg-primary-600 text-white' : 
          'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
      `}>
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : (
          step
        )}
      </div>
      <span className={`ml-3 text-sm font-medium ${
        isActive ? 'text-primary-600 dark:text-primary-400' : 
        'text-gray-500 dark:text-gray-400'
      }`}>
        {title}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-ghost"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add New Property
            </h1>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 1, title: 'Basic Info' },
              { step: 2, title: 'Property Details' },
              { step: 3, title: 'Images' },
              { step: 4, title: 'Review & Submit' }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <StepIndicator
                  step={item.step}
                  title={item.title}
                  isActive={currentStep === item.step}
                  isCompleted={currentStep > item.step}
                />
                {index < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > item.step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Basic Information
                </h2>
                
                <div>
                  <label htmlFor="title" className="form-label">
                    Property Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className={`form-input ${
                      validationErrors.title ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="e.g., Modern Downtown Apartment with City Views"
                    disabled={isLoading}
                  />
                  {validationErrors.title && (
                    <p className="form-error">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className={`form-input ${
                      validationErrors.description ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Describe the property, its features, location benefits, etc."
                    disabled={isLoading}
                  />
                  {validationErrors.description && (
                    <p className="form-error">{validationErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="form-label">
                      Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        className={`form-input pl-10 ${
                          validationErrors.price ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="500000"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.price && (
                      <p className="form-error">{validationErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="form-label">
                      Location *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        className={`form-input pl-10 ${
                          validationErrors.location ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="123 Main St, City, State"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.location && (
                      <p className="form-error">{validationErrors.location}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="property_type" className="form-label">
                      Property Type
                    </label>
                    <select
                      id="property_type"
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      className="form-input"
                      disabled={isLoading}
                    >
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="villa">Villa</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="form-label">
                      Listing Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-input"
                      disabled={isLoading}
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Property Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Property Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="bedrooms" className="form-label">
                      Bedrooms *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Bed className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        className={`form-input pl-10 ${
                          validationErrors.bedrooms ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="3"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.bedrooms && (
                      <p className="form-error">{validationErrors.bedrooms}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bathrooms" className="form-label">
                      Bathrooms *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Bath className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        className={`form-input pl-10 ${
                          validationErrors.bathrooms ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="2"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.bathrooms && (
                      <p className="form-error">{validationErrors.bathrooms}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="size" className="form-label">
                      Size *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Square className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="size"
                        name="size"
                        type="number"
                        value={formData.size}
                        onChange={handleChange}
                        className={`form-input pl-10 ${
                          validationErrors.size ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="2000"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.size && (
                      <p className="form-error">{validationErrors.size}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="size_unit" className="form-label">
                      Size Unit
                    </label>
                    <select
                      id="size_unit"
                      name="size_unit"
                      value={formData.size_unit}
                      onChange={handleChange}
                      className="form-input"
                      disabled={isLoading}
                    >
                      <option value="sqft">Square Feet</option>
                      <option value="sqm">Square Meters</option>
                      <option value="acre">Acres</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="year_built" className="form-label">
                      Year Built
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="year_built"
                        name="year_built"
                        type="number"
                        value={formData.year_built}
                        onChange={handleChange}
                        className={`form-input pl-10 ${
                          validationErrors.year_built ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="2020"
                        min="1800"
                        max={new Date().getFullYear()}
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.year_built && (
                      <p className="form-error">{validationErrors.year_built}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="parking_spaces" className="form-label">
                      Parking Spaces
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="parking_spaces"
                        name="parking_spaces"
                        type="number"
                        value={formData.parking_spaces}
                        onChange={handleChange}
                        className="form-input pl-10"
                        placeholder="2"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="form-label">Amenities</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      placeholder="Add amenity (e.g., Swimming Pool)"
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="btn btn-outline"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                        >
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <label className="form-label">Additional Features</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      placeholder="Add feature (e.g., Hardwood Floors)"
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="btn btn-outline"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                        >
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(feature)}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Property Images
                </h2>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="mb-4">
                    <label htmlFor="images" className="btn btn-primary cursor-pointer">
                      Choose Images
                    </label>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload up to 10 images. Maximum file size: 10MB each.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {validationErrors.images && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      {validationErrors.images}
                    </p>
                  </div>
                )}

                {previewImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Image Preview ({previewImages.length}/10)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                            {index === 0 ? 'Primary' : `Image ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Review & Submit
                </h2>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Property Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {formData.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${parseFloat(formData.price).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {formData.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {formData.property_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Size:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formData.size} {formData.size_unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formData.bedrooms} bed • {formData.bathrooms} bath
                      </span>
                      {formData.parking_spaces && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {formData.parking_spaces} parking
                        </span>
                      )}
                    </div>

                    {formData.amenities.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Amenities:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.features.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Features:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Images:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                      Ready to submit?
                    </p>
                    <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
                      Your property will be listed immediately after submission. You can edit it later from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || isUploadingImages}
                  className="btn btn-primary flex items-center"
                >
                  {isUploadingImages ? (
                    <>
                      <div className="spinner spinner-sm mr-2" />
                      Uploading images...
                    </>
                  ) : isLoading ? (
                    <>
                      <div className="spinner spinner-sm mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Property'
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default AddPropertyPage
