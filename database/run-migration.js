#!/usr/bin/env node
/**
 * Run a SQL migration file against DATABASE_URL.
 * Usage: DATABASE_URL=postgresql://... node database/run-migration.js database/migrations/010_billing_fields.sql
 */
import { readFileSync } from 'fs'
import pg from 'pg'

const migrationPath = process.argv[2]
if (!migrationPath) {
  console.error('Usage: DATABASE_URL=postgresql://... node database/run-migration.js <migration-file>')
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = readFileSync(migrationPath, 'utf8')
const client = new pg.Client({ connectionString: url })

client.connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('Migration completed successfully')
    return client.end()
  })
  .catch((err) => {
    console.error('Migration failed:', err.message)
    process.exit(1)
  })
