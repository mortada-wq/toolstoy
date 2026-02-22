/**
 * Database Client Module
 * 
 * Provides PostgreSQL connection pooling and query utilities
 * for the Soul Engine Lambda function.
 */

import { Pool, PoolClient, QueryResult } from 'pg'

// ============================================================================
// Types
// ============================================================================

export interface QueryOptions {
  text: string
  values?: unknown[]
}

export interface TransactionCallback<T> {
  (client: PoolClient): Promise<T>
}

// ============================================================================
// Connection Pool
// ============================================================================

let pool: Pool | null = null

/**
 * Gets or creates the PostgreSQL connection pool.
 * Uses connection pooling for efficient resource usage.
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    pool = new Pool({
      connectionString,
      max: 10, // Maximum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Timeout after 10 seconds
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false, // Required for RDS
      } : undefined,
    })
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err)
    })
    
    console.log('Database connection pool initialized')
  }
  
  return pool
}

/**
 * Closes the connection pool.
 * Should be called when the Lambda function is shutting down.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('Database connection pool closed')
  }
}

// ============================================================================
// Query Execution
// ============================================================================

/**
 * Executes a parameterized SQL query.
 * 
 * @param text - SQL query text with $1, $2, etc. placeholders
 * @param values - Array of values to substitute into placeholders
 * @returns Query result
 * 
 * @example
 * ```typescript
 * const result = await query(
 *   'SELECT * FROM personas WHERE id = $1',
 *   ['persona-123']
 * )
 * ```
 */
export async function query<T = unknown>(
  text: string,
  values?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool()
  
  try {
    const start = Date.now()
    const result = await pool.query<T>(text, values)
    const duration = Date.now() - start
    
    console.log('Query executed', {
      duration: `${duration}ms`,
      rows: result.rowCount,
      command: result.command,
    })
    
    return result
  } catch (error) {
    console.error('Database query error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: text,
      values,
    })
    throw error
  }
}

/**
 * Executes a query and returns the first row or null.
 * 
 * @param text - SQL query text
 * @param values - Query parameters
 * @returns First row or null if no results
 */
export async function queryOne<T = unknown>(
  text: string,
  values?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, values)
  return result.rows[0] || null
}

/**
 * Executes a query and returns all rows.
 * 
 * @param text - SQL query text
 * @param values - Query parameters
 * @returns Array of rows
 */
export async function queryMany<T = unknown>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  const result = await query<T>(text, values)
  return result.rows
}

// ============================================================================
// Transaction Support
// ============================================================================

/**
 * Executes multiple queries within a transaction.
 * Automatically commits on success or rolls back on error.
 * 
 * @param callback - Function that receives a client and executes queries
 * @returns Result from the callback
 * 
 * @example
 * ```typescript
 * await transaction(async (client) => {
 *   await client.query('INSERT INTO personas ...')
 *   await client.query('INSERT INTO generation_jobs ...')
 * })
 * ```
 */
export async function transaction<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    console.log('Transaction started')
    
    const result = await callback(client)
    
    await client.query('COMMIT')
    console.log('Transaction committed')
    
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction rolled back:', error)
    throw error
  } finally {
    client.release()
  }
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Checks if the database connection is healthy.
 * 
 * @returns True if connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health')
    return result.rows.length > 0
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Escapes a value for use in SQL LIKE queries.
 * 
 * @param value - Value to escape
 * @returns Escaped value
 */
export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&')
}

/**
 * Builds a WHERE clause from an object of conditions.
 * 
 * @param conditions - Object with column names and values
 * @returns Object with WHERE clause text and values array
 */
export function buildWhereClause(
  conditions: Record<string, unknown>
): { text: string; values: unknown[] } {
  const entries = Object.entries(conditions).filter(([, value]) => value !== undefined)
  
  if (entries.length === 0) {
    return { text: '', values: [] }
  }
  
  const clauses = entries.map(([key], index) => `${key} = $${index + 1}`)
  const values = entries.map(([, value]) => value)
  
  return {
    text: `WHERE ${clauses.join(' AND ')}`,
    values,
  }
}
