const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get contact information
router.get('/contact', async (req, res) => {
  try {
    const settings = await query(`
      SELECT key_name, value 
      FROM settings 
      WHERE key_name IN ('contact_phone', 'contact_email', 'contact_location', 'site_name', 'site_description')
    `);
    
    const result = {};
    settings.forEach(setting => {
      result[setting.key_name] = setting.value;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
});

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings ORDER BY key_name');
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update setting (admin only)
router.put('/:keyName', async (req, res) => {
  try {
    const { keyName } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const result = await query(
      'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?',
      [value, keyName]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
