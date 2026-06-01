const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || '35.232.48.145',
  user:             process.env.DB_USER     || 'eltin',
  password:         process.env.DB_PASS     || 'senha123',
  database:         process.env.DB_NAME     || 'BDAlfredPawPalace',
  waitForConnections: true,
  connectionLimit:  10,
  timezone:         'local',
});

module.exports = pool;
