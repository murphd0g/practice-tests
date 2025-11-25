#!/usr/bin/env node
/* eslint-disable */

require('dotenv').config();
const { Pool } = require('pg');
const bcryptjs = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/practice_tests_db';
const email = process.argv[2] || 'jasonhmurphy@gmail.com';
const password = process.argv[3] || 'password';
const name = process.argv[4] || 'Admin User';

(async () => {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });
  try {
    const hashed = await bcryptjs.hash(password, 10);

    const sql = `
      INSERT INTO users (email, password, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, 'admin', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name, role = 'admin', updated_at = NOW()
      RETURNING id, email, name, role
    `;

    const res = await pool.query(sql, [email, hashed, name]);
    console.log('Admin user created/updated:', res.rows[0]);
    console.log('You can now login at http://localhost:3000/auth/login to retrieve your token.');
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
