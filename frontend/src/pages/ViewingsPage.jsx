import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { fetchViewings, scheduleViewing, updateViewing, cancelViewing } from '../store/slices/viewingSlice'
import toast from 'react-hot-toast'

const ViewingsPage = () => {
  const dispatch = useDispatch()
  const { viewings, loading } = useSelector(state => state.viewings)
  const { user } = useSelector(state => state.auth)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [formData, setFormData] = useState({
    propertyId: '',
    date: '',
    time: '',
    notes: ''
  })

  useEffect(() => {
    dispatch(fetchViewings())
  }, [dispatch])

  const handleScheduleViewing = async (e) => {
    e.preventDefault()
    try {
      await dispatch(scheduleViewing(formData)).unwrap()
      setShowScheduleForm(false)
      setFormData({ propertyId: '', date: '', time: '', notes: '' })
      toast.success('Viewing scheduled successfully!')
    } catch (error) {
      toast.error('Failed to schedule viewing')
    }
  }

  const handleUpdateStatus = async (viewingId, status) => {
    try {
      await dispatch(updateViewing({ id: viewingId, status })).unwrap()
      toast.success(`Viewing ${status}!`)
    } catch (error) {
      toast.error('Failed to update viewing')
    }
  }

  const handleCancelViewing = async (viewingId) => {
    try {
      await dispatch(cancelViewing(viewingId)).unwrap()
      toast.success('Viewing cancelled')
    } catch (error) {
      toast.error('Failed to cancel viewing')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (date, time) => {
    const dateTime = new Date(`${date}T${time}`)
    return dateTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Viewings</h1>
            <p className="text-gray-600">Manage your property viewing appointments</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule Viewing
          </button>
        </div>

        {/* Schedule Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule New Viewing</h2>
              <form onSubmit={handleScheduleViewing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property ID
                  </label>
                  <input
                    type="text"
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : viewings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No viewings scheduled</h3>
            <p className="text-gray-600 mb-6">Schedule your first property viewing to get started</p>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule Viewing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viewings.map((viewing) => (
              <motion.div
                key={viewing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${getStatusColor(viewing.status)}`}>
                      {viewing.status}
                    </span>
                    <div className="flex space-x-2">
                      {viewing.status === 'scheduled' && user?.role === 'agent' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(viewing.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelViewing(viewing.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {viewing.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelViewing(viewing.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {formatDateTime(viewing.date, viewing.time)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {viewing.property?.title || `Property #${viewing.propertyId}`}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {viewing.property?.location || 'Location TBD'}
                      </span>
                    </div>

                    {viewing.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {viewing.notes}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={`/properties/${viewing.propertyId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Property Details →
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

export default ViewingsPage
