import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Search, User, Clock, Check, CheckCheck } from 'lucide-react'
import { fetchMessages, sendMessage } from '../store/slices/messageSlice'
import toast from 'react-hot-toast'

const MessagesPage = () => {
  const dispatch = useDispatch()
  const { messages, loading } = useSelector(state => state.messages)
  const { user } = useSelector(state => state.auth)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    dispatch(fetchMessages())
  }, [dispatch])

  const filteredMessages = messages.filter(message =>
    message.sender?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedMessage) return

    try {
      await dispatch(sendMessage({
        receiverId: selectedMessage.sender.id,
        content: replyText,
        propertyId: selectedMessage.propertyId
      })).unwrap()
      
      setReplyText('')
      toast.success('Message sent successfully!')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
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
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            {/* Messages List */}
            <div className="w-full md:w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {message.sender?.avatar ? (
                            <img
                              src={message.sender.avatar}
                              alt={message.sender.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {message.sender?.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {message.content}
                          </p>
                          {!message.read && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                New
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="hidden md:flex md:w-2/3 flex-col">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {selectedMessage.sender?.avatar ? (
                            <img
                              src={selectedMessage.sender.avatar}
                              alt={selectedMessage.sender.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedMessage.sender?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatTime(selectedMessage.createdAt)}
                          </p>
                        </div>
                      </div>
                      {selectedMessage.read ? (
                        <CheckCheck className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Check className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedMessage.subject}
                    </h2>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </div>

                    {selectedMessage.propertyId && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Related Property:</p>
                        <a
                          href={`/properties/${selectedMessage.propertyId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Property Details →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Reply Section */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a message
                    </h3>
                    <p className="text-gray-600">
                      Choose a message from the list to view and reply
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessagesPage
