import React from 'react'
import { motion } from 'framer-motion'
import { Building, Users, Award, Shield, Star, TrendingUp, MapPin, Phone, Mail } from 'lucide-react'

const AboutPage = () => {
  const stats = [
    { label: 'Properties Sold', value: '2,500+', icon: Building },
    { label: 'Happy Clients', value: '1,800+', icon: Users },
    { label: 'Years Experience', value: '15+', icon: Award },
    { label: 'Expert Agents', value: '50+', icon: Shield }
  ]

  const features = [
    {
      icon: Star,
      title: 'Expert Agents',
      description: 'Our agents are licensed professionals with extensive market knowledge and negotiation skills.'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Get real-time market data and trends to make informed decisions.'
    },
    {
      icon: Shield,
      title: 'Secure Process',
      description: 'Your data and transactions are protected with industry-leading security.'
    }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/team/sarah.jpg',
      bio: '15+ years in real estate, passionate about helping people find their dream homes.'
    },
    {
      name: 'William Tuyiringire',
      role: 'Head of Operations',
      image: '/team/michael.jpg',
      bio: 'Expert in property management and customer relations.'
    },
    {
      name: 'Emily Davis',
      role: 'Lead Agent',
      image: '/team/emily.jpg',
      bio: 'Specializes in luxury properties and investment opportunities.'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            About Real Estate Platform
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl max-w-3xl mx-auto"
          >
            We're revolutionizing the real estate experience with technology, expertise, and a commitment to excellence.
          </motion.p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with personalized service to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-lg text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our dedicated professionals are here to help you every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            To transform the real estate experience by making it more transparent, efficient, and accessible for everyone. 
            We believe finding your dream home or selling your property should be a seamless, stress-free process 
            powered by technology and guided by human expertise.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600">
                Clear pricing, honest communication, and full disclosure at every step.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                Leveraging technology to streamline processes and enhance the user experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                Committed to delivering exceptional service and results for every client.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied clients who found their perfect property with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/properties"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              Browse Properties
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AboutPage
