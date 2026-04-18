const { findOne, findMany, search } = require('../config/database');

class RecommendationEngine {
  constructor() {
    this.weights = {
      price: 0.3,
      location: 0.25,
      property_type: 0.2,
      size: 0.15,
      amenities: 0.1
    };
  }

  // Get personalized recommendations for a user
  async getUserRecommendations(userId, limit = 10) {
    try {
      // Get user's search history and preferences
      const userHistory = await this.getUserSearchHistory(userId);
      const userFavorites = await this.getUserFavorites(userId);
      const userProfile = await this.getUserProfile(userId);

      // Build user preference vector
      const preferences = this.buildUserPreferences(userHistory, userFavorites, userProfile);

      // Get all active properties
      const allProperties = await findMany('properties', { is_active: true });

      // Calculate similarity scores
      const scoredProperties = allProperties.map(property => ({
        ...property,
        score: this.calculateSimilarityScore(property, preferences)
      }));

      // Sort by score and filter out user's own properties
      const recommendations = scoredProperties
        .filter(property => property.agent_id !== userId)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return [];
    }
  }

  // Get similar properties for a given property
  async getSimilarProperties(propertyId, limit = 5) {
    try {
      // Get the reference property
      const referenceProperty = await findOne('properties', { id: propertyId, is_active: true });
      
      if (!referenceProperty) {
        return [];
      }

      // Get all active properties except the reference property
      const allProperties = await findMany('properties', { 
        is_active: true,
        id: { $ne: propertyId } 
      });

      // Calculate similarity scores
      const scoredProperties = allProperties.map(property => ({
        ...property,
        score: this.calculatePropertySimilarity(referenceProperty, property)
      }));

      // Sort by score and return top matches
      const similarProperties = scoredProperties
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return similarProperties;
    } catch (error) {
      console.error('Error getting similar properties:', error);
      return [];
    }
  }

  // Get trending properties
  async getTrendingProperties(limit = 10, timeWindow = 7) {
    try {
      // Get properties with high engagement metrics
      const query = `
        SELECT p.*, 
          COUNT(DISTINCT f.id) as favorites_count,
          COUNT(DISTINCT v.id) as viewings_count,
          COUNT(DISTINCT m.id) as inquiries_count,
          AVG(r.rating) as average_rating,
          COUNT(DISTINCT r.id) as reviews_count,
          p.views_count as total_views
        FROM properties p
        LEFT JOIN favorites f ON p.id = f.property_id
        LEFT JOIN property_viewings v ON p.id = v.property_id AND v.created_at >= DATE_SUB(NOW(), INTERVAL ${timeWindow} DAY)
        LEFT JOIN messages m ON p.id = m.property_id AND m.created_at >= DATE_SUB(NOW(), INTERVAL ${timeWindow} DAY)
        LEFT JOIN reviews r ON p.id = r.property_id AND r.is_approved = TRUE
        WHERE p.is_active = TRUE
        GROUP BY p.id
        ORDER BY (
          (favorites_count * 0.3) + 
          (viewings_count * 0.25) + 
          (inquiries_count * 0.2) + 
          (IFNULL(average_rating, 0) * 0.15) + 
          (total_views * 0.1)
        ) DESC
        LIMIT ?
      `;

      const { query: dbQuery } = require('../config/database');
      const trendingProperties = await dbQuery(query, [limit]);

      return trendingProperties;
    } catch (error) {
      console.error('Error getting trending properties:', error);
      return [];
    }
  }

  // Get personalized search suggestions
  async getSearchSuggestions(userId, query) {
    try {
      // Get user's search history
      const userHistory = await this.getUserSearchHistory(userId);
      
      // Extract common terms from user history
      const commonTerms = this.extractCommonTerms(userHistory);
      
      // Get properties matching the query
      const matchingProperties = await search('properties', query, { is_active: true }, '*', 'views_count DESC', 5);
      
      // Extract location and type suggestions
      const suggestions = {
        locations: this.extractLocationSuggestions(matchingProperties),
        propertyTypes: this.extractTypeSuggestions(matchingProperties),
        priceRanges: this.extractPriceSuggestions(matchingProperties),
        commonTerms: commonTerms.filter(term => 
          term.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5)
      };

      return suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return { locations: [], propertyTypes: [], priceRanges: [], commonTerms: [] };
    }
  }

  // Build user preferences based on history and favorites
  buildUserPreferences(history, favorites, profile) {
    const preferences = {
      price_range: { min: 0, max: 1000000 },
      preferred_types: [],
      preferred_locations: [],
      size_range: { min: 0, max: 5000 },
      amenities: [],
      features: []
    };

    // Analyze favorites
    if (favorites.length > 0) {
      const prices = favorites.map(f => f.price).filter(p => p);
      const sizes = favorites.map(f => f.size).filter(s => s);
      
      if (prices.length > 0) {
        preferences.price_range.min = Math.min(...prices) * 0.8;
        preferences.price_range.max = Math.max(...prices) * 1.2;
      }
      
      if (sizes.length > 0) {
        preferences.size_range.min = Math.min(...sizes) * 0.8;
        preferences.size_range.max = Math.max(...sizes) * 1.2;
      }

      // Count property types
      const typeCounts = {};
      favorites.forEach(f => {
        typeCounts[f.property_type] = (typeCounts[f.property_type] || 0) + 1;
      });
      
      preferences.preferred_types = Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);

      // Extract common locations
      const locations = {};
      favorites.forEach(f => {
        const city = f.location.split(',')[0].trim();
        locations[city] = (locations[city] || 0) + 1;
      });
      
      preferences.preferred_locations = Object.entries(locations)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([location]) => location);
    }

    // Analyze search history
    if (history.length > 0) {
      history.forEach(search => {
        if (search.filters) {
          // Update preferences based on search filters
          if (search.filters.property_type && !preferences.preferred_types.includes(search.filters.property_type)) {
            preferences.preferred_types.push(search.filters.property_type);
          }
          
          if (search.filters.min_price) {
            preferences.price_range.min = Math.max(preferences.price_range.min, search.filters.min_price * 0.8);
          }
          
          if (search.filters.max_price) {
            preferences.price_range.max = Math.min(preferences.price_range.max, search.filters.max_price * 1.2);
          }
        }
      });
    }

    return preferences;
  }

  // Calculate similarity score between property and user preferences
  calculateSimilarityScore(property, preferences) {
    let score = 0;

    // Price similarity (30% weight)
    if (property.price >= preferences.price_range.min && property.price <= preferences.price_range.max) {
      score += this.weights.price;
    } else {
      // Partial score for being close to range
      const priceDiff = Math.min(
        Math.abs(property.price - preferences.price_range.min),
        Math.abs(property.price - preferences.price_range.max)
      ) / preferences.price_range.max;
      score += this.weights.price * (1 - Math.min(priceDiff, 1));
    }

    // Location similarity (25% weight)
    const propertyCity = property.location.split(',')[0].trim();
    if (preferences.preferred_locations.includes(propertyCity)) {
      score += this.weights.location;
    }

    // Property type similarity (20% weight)
    if (preferences.preferred_types.includes(property.property_type)) {
      score += this.weights.property_type;
    }

    // Size similarity (15% weight)
    if (property.size >= preferences.size_range.min && property.size <= preferences.size_range.max) {
      score += this.weights.size;
    } else {
      // Partial score for being close to range
      const sizeDiff = Math.min(
        Math.abs(property.size - preferences.size_range.min),
        Math.abs(property.size - preferences.size_range.max)
      ) / preferences.size_range.max;
      score += this.weights.size * (1 - Math.min(sizeDiff, 1));
    }

    // Amenities similarity (10% weight)
    if (property.amenities && preferences.amenities.length > 0) {
      const propertyAmenities = JSON.parse(property.amenities || '[]');
      const commonAmenities = propertyAmenities.filter(a => preferences.amenities.includes(a));
      score += this.weights.amenities * (commonAmenities.length / Math.max(propertyAmenities.length, preferences.amenities.length));
    }

    // Boost for popular properties
    if (property.views_count > 100) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  // Calculate similarity between two properties
  calculatePropertySimilarity(property1, property2) {
    let score = 0;

    // Price similarity
    const priceDiff = Math.abs(property1.price - property2.price) / Math.max(property1.price, property2.price);
    score += (1 - Math.min(priceDiff, 1)) * 0.3;

    // Type similarity
    if (property1.property_type === property2.property_type) {
      score += 0.2;
    }

    // Size similarity
    const sizeDiff = Math.abs(property1.size - property2.size) / Math.max(property1.size, property2.size);
    score += (1 - Math.min(sizeDiff, 1)) * 0.15;

    // Location similarity (same city)
    const city1 = property1.location.split(',')[0].trim();
    const city2 = property2.location.split(',')[0].trim();
    if (city1 === city2) {
      score += 0.25;
    }

    // Bedroom similarity
    const bedDiff = Math.abs(property1.bedrooms - property2.bedrooms);
    score += (1 - Math.min(bedDiff / 5, 1)) * 0.05;

    // Bathroom similarity
    const bathDiff = Math.abs(property1.bathrooms - property2.bathrooms);
    score += (1 - Math.min(bathDiff / 5, 1)) * 0.05;

    return Math.min(score, 1);
  }

  // Get user's search history
  async getUserSearchHistory(userId) {
    try {
      const { query: dbQuery } = require('../config/database');
      const sql = `
        SELECT * FROM search_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      const history = await dbQuery(sql, [userId]);
      
      // Parse filters from history
      return history.map(h => ({
        ...h,
        filters: h.filters ? JSON.parse(h.filters) : null
      }));
    } catch (error) {
      console.error('Error getting user search history:', error);
      return [];
    }
  }

  // Get user's favorites
  async getUserFavorites(userId) {
    try {
      const query = `
        SELECT p.* FROM favorites f
        JOIN properties p ON f.property_id = p.id
        WHERE f.user_id = ? AND p.is_active = TRUE
        ORDER BY f.created_at DESC
        LIMIT 20
      `;
      const { query: dbQuery } = require('../config/database');
      const favorites = await dbQuery(query, [userId]);
      return favorites;
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return [];
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      return await findOne('users', { id: userId });
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Extract common terms from search history
  extractCommonTerms(history) {
    const terms = {};
    
    history.forEach(search => {
      if (search.search_query) {
        const words = search.search_query.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) {
            terms[word] = (terms[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(terms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([term]) => term);
  }

  // Extract location suggestions
  extractLocationSuggestions(properties) {
    const locations = {};
    
    properties.forEach(property => {
      const city = property.location.split(',')[0].trim();
      if (city) {
        locations[city] = (locations[city] || 0) + 1;
      }
    });

    return Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location]) => location);
  }

  // Extract property type suggestions
  extractTypeSuggestions(properties) {
    const types = {};
    
    properties.forEach(property => {
      types[property.property_type] = (types[property.property_type] || 0) + 1;
    });

    return Object.keys(types);
  }

  // Extract price range suggestions
  extractPriceSuggestions(properties) {
    const prices = properties.map(p => p.price).filter(p => p).sort((a, b) => a - b);
    
    if (prices.length === 0) return [];

    return [
      { label: 'Under $200K', min: 0, max: 200000 },
      { label: '$200K - $400K', min: 200000, max: 400000 },
      { label: '$400K - $600K', min: 400000, max: 600000 },
      { label: '$600K - $800K', min: 600000, max: 800000 },
      { label: 'Over $800K', min: 800000, max: null }
    ];
  }

  // Update recommendation weights
  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  // Get recommendation statistics
  async getRecommendationStats() {
    try {
      const stats = {
        total_properties: await this.countActiveProperties(),
        total_users: await this.countActiveUsers(),
        avg_recommendation_score: await this.calculateAvgScore(),
        most_recommended_types: await this.getMostRecommendedTypes(),
        popular_locations: await this.getPopularLocations()
      };

      return stats;
    } catch (error) {
      console.error('Error getting recommendation stats:', error);
      return {};
    }
  }

  // Helper methods for stats
  async countActiveProperties() {
    const { count } = require('../config/database');
    return await count('properties', { is_active: true });
  }

  async countActiveUsers() {
    const { count } = require('../config/database');
    return await count('users', { is_active: true });
  }

  async calculateAvgScore() {
    // This would calculate average recommendation scores across all users
    // Implementation would depend on your tracking system
    return 0.75; // placeholder
  }

  async getMostRecommendedTypes() {
    const { query: dbQuery } = require('../config/database');
    const sql = `
      SELECT property_type, COUNT(*) as count 
      FROM properties 
      WHERE is_active = TRUE 
      GROUP BY property_type 
      ORDER BY count DESC 
      LIMIT 5
    `;
    return await dbQuery(sql);
  }

  async getPopularLocations() {
    const { query: dbQuery } = require('../config/database');
    const sql = `
      SELECT SUBSTRING_INDEX(location, ',', 1) as city, COUNT(*) as count 
      FROM properties 
      WHERE is_active = TRUE 
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 10
    `;
    return await dbQuery(sql);
  }
}

// Create and export singleton instance
const recommendationEngine = new RecommendationEngine();

module.exports = recommendationEngine;
