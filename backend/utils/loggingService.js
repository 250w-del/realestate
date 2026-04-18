const fs = require('fs');
const path = require('path');

class LoggingService {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLogLevel = process.env.LOG_LEVEL ? this.logLevels[process.env.LOG_LEVEL.toUpperCase()] : this.logLevels.INFO;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Generic log method
  log(level, message, meta = {}) {
    if (this.logLevels[level] > this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta,
      pid: process.pid,
      hostname: require('os').hostname()
    };

    // Format log entry
    const formattedLog = this.formatLogEntry(logEntry);

    // Write to appropriate log file
    this.writeToLogFile(level, formattedLog);

    // Also write to console in development
    if (process.env.NODE_ENV === 'development') {
      this.writeToConsole(level, formattedLog);
    }

    // Send to external logging service if configured
    if (process.env.EXTERNAL_LOGGING_ENABLED === 'true') {
      this.sendToExternalService(logEntry);
    }
  }

  // Convenience methods
  error(message, meta) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta) {
    this.log('WARN', message, meta);
  }

  info(message, meta) {
    this.log('INFO', message, meta);
  }

  debug(message, meta) {
    this.log('DEBUG', message, meta);
  }

  // Security logging
  security(event, details = {}) {
    this.log('WARN', `SECURITY: ${event}`, {
      category: 'security',
      ip: details.ip,
      userAgent: details.userAgent,
      userId: details.userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // API request logging
  apiRequest(req, res, responseTime) {
    this.log('INFO', 'API Request', {
      category: 'api',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
  }

  // Database operation logging
  database(operation, table, details = {}) {
    this.log('INFO', `Database: ${operation} on ${table}`, {
      category: 'database',
      operation,
      table,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Authentication logging
  auth(event, details = {}) {
    this.log('INFO', `Auth: ${event}`, {
      category: 'auth',
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      success: details.success,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Business logic logging
  business(event, details = {}) {
    this.log('INFO', `Business: ${event}`, {
      category: 'business',
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Performance logging
  performance(operation, duration, details = {}) {
    this.log('INFO', `Performance: ${operation}`, {
      category: 'performance',
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Error tracking
  errorTracking(error, context = {}) {
    this.log('ERROR', error.message || 'Unknown error', {
      category: 'error',
      stack: error.stack,
      name: error.name,
      code: error.code,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Format log entry for file output
  formatLogEntry(entry) {
    const { timestamp, level, message, meta, pid, hostname } = entry;
    
    let metaString = '';
    if (Object.keys(meta).length > 0) {
      metaString = ` ${JSON.stringify(meta)}`;
    }

    return `[${timestamp}] [${level}] [${hostname}:${pid}] ${message}${metaString}\n`;
  }

  // Write to log file
  writeToLogFile(level, formattedLog) {
    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    
    try {
      fs.appendFileSync(logFile, formattedLog);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Write to console with colors
  writeToConsole(level, formattedLog) {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[37m' // White
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}${formattedLog}${reset}`);
  }

  // Send to external logging service (e.g., ELK, Splunk, etc.)
  async sendToExternalService(logEntry) {
    try {
      // This would integrate with your external logging service
      // For example, sending to Elasticsearch, Splunk, Loggly, etc.
      
      // Example: Send to Elasticsearch
      // await this.sendToElasticsearch(logEntry);
      
      // Example: Send to Loggly
      // await this.sendToLoggly(logEntry);
      
      // Example: Send to custom webhook
      // await this.sendToWebhook(logEntry);
      
    } catch (error) {
      console.error('Failed to send to external logging service:', error);
    }
  }

  // Rotate log files
  rotateLogs() {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    try {
      const logFiles = fs.readdirSync(this.logDir);
      
      logFiles.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.size > maxFileSize) {
          // Rotate file
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedFile = path.join(this.logDir, `${file}.${timestamp}`);
          
          fs.renameSync(filePath, rotatedFile);
          
          // Remove old files
          this.removeOldFiles(file, maxFiles);
        }
      });
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  // Remove old log files
  removeOldFiles(baseFile, maxFiles) {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith(baseFile))
        .sort((a, b) => {
          const aTime = fs.statSync(path.join(this.logDir, a)).mtime;
          const bTime = fs.statSync(path.join(this.logDir, b)).mtime;
          return bTime - aTime; // Sort by modification time (newest first)
        });

      // Keep only the most recent files
      const filesToKeep = files.slice(0, maxFiles);
      const filesToRemove = files.slice(maxFiles);

      filesToRemove.forEach(file => {
        const filePath = path.join(this.logDir, file);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Failed to remove old log files:', error);
    }
  }

  // Get log statistics
  getLogStats() {
    try {
      const stats = {};
      const logFiles = fs.readdirSync(this.logDir);
      
      logFiles.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const fileStats = fs.statSync(filePath);
        
        stats[file] = {
          size: fileStats.size,
          created: fileStats.birthtime,
          modified: fileStats.mtime,
          lines: this.countLines(filePath)
        };
      });

      return stats;
    } catch (error) {
      console.error('Failed to get log stats:', error);
      return {};
    }
  }

  // Count lines in a file
  countLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  // Search logs
  searchLogs(query, options = {}) {
    const {
      level = null,
      startDate = null,
      endDate = null,
      limit = 100
    } = options;

    try {
      const logFiles = fs.readdirSync(this.logDir);
      const results = [];

      logFiles.forEach(file => {
        if (level && !file.toLowerCase().includes(level.toLowerCase())) {
          return;
        }

        const filePath = path.join(this.logDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            try {
              const logEntry = this.parseLogLine(line);
              
              // Filter by date range if specified
              if (startDate && new Date(logEntry.timestamp) < new Date(startDate)) {
                return;
              }
              
              if (endDate && new Date(logEntry.timestamp) > new Date(endDate)) {
                return;
              }

              results.push(logEntry);
              
              if (results.length >= limit) {
                return false; // Stop processing
              }
            } catch (error) {
              // Skip malformed lines
            }
          }
        });

        if (results.length >= limit) {
          return false; // Stop processing files
        }
      });

      return results.slice(0, limit);
    } catch (error) {
      console.error('Failed to search logs:', error);
      return [];
    }
  }

  // Parse a log line back to object
  parseLogLine(line) {
    // Parse log format: [timestamp] [level] [hostname:pid] message meta
    const match = line.match(/^\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.+)$/);
    
    if (!match) {
      throw new Error('Invalid log format');
    }

    const [, timestamp, level, hostPid, ...messageParts] = match;
    const message = messageParts.join(' ').trim();
    
    // Try to parse JSON metadata
    let meta = {};
    let cleanMessage = message;
    
    try {
      const lastBrace = message.lastIndexOf('{');
      if (lastBrace > 0) {
        const possibleMeta = message.substring(lastBrace);
        const parsedMeta = JSON.parse(possibleMeta);
        meta = parsedMeta;
        cleanMessage = message.substring(0, lastBrace).trim();
      }
    } catch (error) {
      // No valid JSON metadata
    }

    const [hostname, pid] = hostPid.split(':');

    return {
      timestamp,
      level,
      message: cleanMessage,
      meta,
      pid: parseInt(pid),
      hostname
    };
  }

  // Cleanup old logs
  cleanup() {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    try {
      const logFiles = fs.readdirSync(this.logDir);
      
      logFiles.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
    }
  }
}

// Create and export singleton instance
const loggingService = new LoggingService();

// Schedule log rotation (run daily)
setInterval(() => {
  loggingService.rotateLogs();
}, 24 * 60 * 60 * 1000);

// Schedule cleanup (run weekly)
setInterval(() => {
  loggingService.cleanup();
}, 7 * 24 * 60 * 60 * 1000);

module.exports = loggingService;
