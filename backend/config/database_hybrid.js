const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// PostgreSQL configuration
const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'real_estate',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Shorter timeout for faster fallback
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://rmqmvkaerxxjqxxybkqi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-';

let pgPool = null;
let supabase = null;
let useSupabase = false;

// Initialize connections
const initializeConnections = async () => {
  console.log('Initializing database connections...');
  
  // Try PostgreSQL first
  try {
    pgPool = new Pool(pgConfig);
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ PostgreSQL connection successful');
    useSupabase = false;
    return;
  } catch (error) {
    console.log('⚠️  PostgreSQL connection failed:', error.message);
    if (pgPool) {
      await pgPool.end();
      pgPool = null;
    }
  }
  
  // Fallback to Supabase
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }
    
    console.log('✅ Supabase client connection successful');
    console.log('📡 Using Supabase REST API instead of direct PostgreSQL');
    useSupabase = true;
  } catch (error) {
    console.error('❌ Both PostgreSQL and Supabase connections failed');
    throw new Error('No database connection available');
  }
};

// Execute query
const query = async (sql, params = []) => {
  if (useSupabase) {
    throw new Error('Raw SQL queries not supported with Supabase client. Use helper functions instead.');
  }
  
  if (!pgPool) {
    throw new Error('PostgreSQL connection not available');
  }
  
  try {
    const result = await pgPool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Get single record
const findOne = async (table, conditions = {}, select = '*') => {
  if (useSupabase) {
    try {
      let query = supabase.from(table).select(select);
      
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
  } else {
    // PostgreSQL implementation
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(conditions);
    const sql = `SELECT ${select} FROM ${table} WHERE ${whereClause} LIMIT 1`;
    const result = await query(sql, values);
    return result[0] || null;
  }
};

// Get multiple records
const findMany = async (table, conditions = {}, select = '*', orderBy = '', limit = '', offset = '') => {
  if (useSupabase) {
    try {
      let query = supabase.from(table).select(select);
      
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      if (orderBy) {
        const [column, direction] = orderBy.split(' ');
        query = query.order(column, { ascending: direction?.toUpperCase() === 'ASC' });
      }
      
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
  } else {
    // PostgreSQL implementation
    let sql = `SELECT ${select} FROM ${table}`;
    const values = [];
    let paramIndex = 1;
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => {
        return `${key} = $${paramIndex++}`;
      }).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT $${paramIndex++}`;
      values.push(parseInt(limit));
    }
    
    if (offset) {
      sql += ` OFFSET $${paramIndex++}`;
      values.push(parseInt(offset));
    }
    
    return await query(sql, values);
  }
};

// Insert record
const insert = async (table, data) => {
  if (useSupabase) {
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
  } else {
    // PostgreSQL implementation
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(data);
    const sql = `INSERT INTO ${table} (${fields}) VALUES (${placeholders}) RETURNING id`;
    const result = await query(sql, values);
    return result[0].id;
  }
};

// Update record
const update = async (table, data, conditions) => {
  if (useSupabase) {
    try {
      let query = supabase.from(table).update(data);
      
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
  } else {
    // PostgreSQL implementation
    const dataKeys = Object.keys(data);
    const conditionKeys = Object.keys(conditions);
    
    let paramIndex = 1;
    const setClause = dataKeys.map(key => `${key} = $${paramIndex++}`).join(', ');
    const whereClause = conditionKeys.map(key => `${key} = $${paramIndex++}`).join(' AND ');
    
    const values = [...Object.values(data), ...Object.values(conditions)];
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const result = await query(sql, values);
    return result.length;
  }
};

// Delete record
const remove = async (table, conditions) => {
  if (useSupabase) {
    try {
      let query = supabase.from(table).delete();
      
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
  } else {
    // PostgreSQL implementation
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(conditions);
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const result = await query(sql, values);
    return result.length;
  }
};

// Count records
const count = async (table, conditions = {}) => {
  if (useSupabase) {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
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
  } else {
    // PostgreSQL implementation
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const values = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map((key, index) => {
        return `${key} = $${index + 1}`;
      }).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }
    
    const result = await query(sql, values);
    return parseInt(result[0].count);
  }
};

// Search with full-text search
const search = async (table, searchText, conditions = {}, select = '*', orderBy = '', limit = '', offset = '') => {
  if (useSupabase) {
    try {
      let query = supabase.from(table).select(select);
      
      if (searchText) {
        query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%,location.ilike.%${searchText}%`);
      }
      
      Object.entries(conditions).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
      
      if (orderBy) {
        const [column, direction] = orderBy.split(' ');
        query = query.order(column, { ascending: direction?.toUpperCase() === 'ASC' });
      }
      
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
  } else {
    // PostgreSQL implementation (existing code)
    let sql = `SELECT ${select} FROM ${table}`;
    const values = [];
    let paramIndex = 1;
    
    const whereConditions = [];
    
    if (searchText) {
      whereConditions.push(`(
        to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(location, '')) 
        @@ plainto_tsquery('english', $${paramIndex++})
      )`);
      values.push(searchText);
    }
    
    if (Object.keys(conditions).length > 0) {
      Object.entries(conditions).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          whereConditions.push(`${key} IN (${placeholders})`);
          values.push(...value);
        } else {
          whereConditions.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
      });
    }
    
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT $${paramIndex++}`;
      values.push(parseInt(limit));
    }
    
    if (offset) {
      sql += ` OFFSET $${paramIndex++}`;
      values.push(parseInt(offset));
    }
    
    return await query(sql, values);
  }
};

// Transaction (limited support with Supabase)
const transaction = async (callback) => {
  if (useSupabase) {
    console.warn('Transactions not fully supported with Supabase client');
    return await callback(supabase);
  } else {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

// Test connection
const testConnection = async () => {
  await initializeConnections();
  
  if (useSupabase) {
    console.log('📡 Database: Supabase REST API');
  } else {
    console.log('🐘 Database: PostgreSQL Direct Connection');
  }
  
  return true;
};

// Graceful shutdown
const closePool = async () => {
  if (pgPool) {
    await pgPool.end();
    console.log('PostgreSQL pool closed');
  }
  if (supabase) {
    console.log('Supabase client closed');
  }
};

// Initialize on startup
initializeConnections().catch(console.error);

module.exports = {
  query,
  findOne,
  findMany,
  insert,
  update,
  remove,
  count,
  search,
  transaction,
  testConnection,
  closePool
};