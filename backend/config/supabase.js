const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://rmqmvkaerxxjqxxybkqi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-';

console.log('Supabase Configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Key:', supabaseKey.substring(0, 20) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
const testConnection = async () => {
  try {
    // Test with a simple query to the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  Supabase connected but tables not created yet');
        console.log('   Please run the database schema first');
        return false;
      } else {
        console.log('❌ Supabase connection failed:', error.message);
        return false;
      }
    }
    
    console.log('✅ Supabase connected successfully');
    console.log('✅ Database tables accessible');
    return true;
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    return false;
  }
};

// Helper functions that mimic the PostgreSQL database.js interface
const query = async (sql, params = []) => {
  throw new Error('Raw SQL queries not supported with Supabase client. Use Supabase methods instead.');
};

const findOne = async (table, conditions = {}, select = '*') => {
  try {
    let query = supabase.from(table).select(select);
    
    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Supabase findOne error:', error.message);
    throw error;
  }
};

const findMany = async (table, conditions = {}, select = '*', orderBy = '', limit = '', offset = '') => {
  try {
    let query = supabase.from(table).select(select);
    
    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Add ordering
    if (orderBy) {
      const [column, direction] = orderBy.split(' ');
      query = query.order(column, { ascending: direction?.toUpperCase() === 'ASC' });
    }
    
    // Add limit and offset
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = offset ? parseInt(offset) : 0;
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Supabase findMany error:', error.message);
    throw error;
  }
};

const insert = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select('id')
      .single();
    
    if (error) throw error;
    
    return result.id;
  } catch (error) {
    console.error('Supabase insert error:', error.message);
    throw error;
  }
};

const update = async (table, data, conditions) => {
  try {
    let query = supabase.from(table).update(data);
    
    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data: result, error } = await query;
    
    if (error) throw error;
    
    return result ? result.length : 0;
  } catch (error) {
    console.error('Supabase update error:', error.message);
    throw error;
  }
};

const remove = async (table, conditions) => {
  try {
    let query = supabase.from(table).delete();
    
    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data: result, error } = await query;
    
    if (error) throw error;
    
    return result ? result.length : 0;
  } catch (error) {
    console.error('Supabase remove error:', error.message);
    throw error;
  }
};

const count = async (table, conditions = {}) => {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    
    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { count, error } = await query;
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Supabase count error:', error.message);
    throw error;
  }
};

const search = async (table, searchText, conditions = {}, select = '*', orderBy = '', limit = '', offset = '') => {
  try {
    let query = supabase.from(table).select(select);
    
    // Add text search (using ilike for case-insensitive search)
    if (searchText) {
      query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%,location.ilike.%${searchText}%`);
    }
    
    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });
    
    // Add ordering
    if (orderBy) {
      const [column, direction] = orderBy.split(' ');
      query = query.order(column, { ascending: direction?.toUpperCase() === 'ASC' });
    }
    
    // Add limit and offset
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = offset ? parseInt(offset) : 0;
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Supabase search error:', error.message);
    throw error;
  }
};

const transaction = async (callback) => {
  // Supabase doesn't support transactions in the same way
  // For now, we'll just execute the callback
  console.warn('Transactions not fully supported with Supabase client');
  return await callback(supabase);
};

// Test connection on startup
testConnection();

module.exports = {
  supabase,
  query,
  findOne,
  findMany,
  insert,
  update,
  remove,
  count,
  search,
  transaction,
  testConnection
};