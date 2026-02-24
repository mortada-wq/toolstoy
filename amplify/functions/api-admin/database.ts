import { Pool, PoolClient, QueryResultRow } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
      } : undefined,
    })
    
    pool.on('error', (err) => {
      console.error('Database pool error:', err)
    })
  }
  
  return pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query<T>(text, values)
  return result.rows
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, values)
  return rows[0] || null
}

export async function execute(text: string, values?: unknown[]): Promise<number> {
  const pool = getPool()
  const result = await pool.query(text, values)
  return result.rowCount || 0
}

// Media Folders
export async function getMediaFolders(adminId: string) {
  return query(
    `SELECT f.id, f.name, f.description, f.created_at,
            COUNT(a.id) as asset_count
     FROM admin_media_folders f
     LEFT JOIN admin_media_assets a ON f.id = a.folder_id
     WHERE f.created_by = $1 OR EXISTS (
       SELECT 1 FROM admin_folder_permissions p 
       WHERE p.folder_id = f.id AND p.admin_id = $1
     )
     GROUP BY f.id
     ORDER BY f.name ASC`,
    [adminId]
  )
}

export async function createMediaFolder(name: string, description: string | null, adminId: string) {
  return queryOne(
    `INSERT INTO admin_media_folders (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, created_at`,
    [name, description, adminId]
  )
}

export async function deleteMediaFolder(folderId: string, adminId: string) {
  return execute(
    `DELETE FROM admin_media_folders 
     WHERE id = $1 AND created_by = $1`,
    [folderId, adminId]
  )
}

// Media Assets
export async function getMediaAssets(folderId: string) {
  return query(
    `SELECT id, folder_id, asset_name, asset_url, asset_type, created_by, created_at
     FROM admin_media_assets
     WHERE folder_id = $1
     ORDER BY created_at DESC`,
    [folderId]
  )
}

export async function createMediaAsset(
  folderId: string,
  assetName: string,
  assetUrl: string,
  assetType: string,
  adminId: string
) {
  return queryOne(
    `INSERT INTO admin_media_assets (folder_id, asset_name, asset_url, asset_type, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, folder_id, asset_name, asset_url, asset_type, created_at`,
    [folderId, assetName, assetUrl, assetType, adminId]
  )
}

export async function deleteMediaAsset(assetId: string) {
  return execute(
    `DELETE FROM admin_media_assets WHERE id = $1`,
    [assetId]
  )
}

// Test Generations
export async function createTestGeneration(
  adminId: string,
  promptTemplateId: string | null,
  promptUsed: string,
  generationResult: any,
  cost: number
) {
  return queryOne(
    `INSERT INTO admin_test_generations 
     (admin_id, environment, prompt_template_id, prompt_used, generation_result, cost)
     VALUES ($1, 'test', $2, $3, $4, $5)
     RETURNING id, admin_id, environment, prompt_used, cost, created_at`,
    [adminId, promptTemplateId, promptUsed, JSON.stringify(generationResult), cost]
  )
}

export async function getGenerationHistory(adminId: string, mode?: string) {
  let query_text = `
    SELECT id, admin_id, environment, prompt_template_id, prompt_used, 
           generation_result, cost, created_at
    FROM admin_test_generations
    WHERE admin_id = $1
  `
  const values: any[] = [adminId]
  
  if (mode && mode !== 'all') {
    query_text += ` AND environment = $2`
    values.push(mode)
  }
  
  query_text += ` ORDER BY created_at DESC LIMIT 100`
  
  return query(query_text, values)
}

export async function getTotalCosts(adminId: string) {
  const result = await queryOne<{
    test_cost: string
    production_cost: string
  }>(
    `SELECT 
      COALESCE(SUM(CASE WHEN environment = 'test' THEN cost ELSE 0 END), 0) as test_cost,
      COALESCE(SUM(CASE WHEN environment = 'production' THEN cost ELSE 0 END), 0) as production_cost
     FROM admin_test_generations
     WHERE admin_id = $1`,
    [adminId]
  )
  
  return {
    testCost: parseFloat(result?.test_cost || '0'),
    productionCost: parseFloat(result?.production_cost || '0'),
  }
}

// Audit Logging
export async function logAuditEvent(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: any,
  ipAddress: string | null,
  userAgent: string | null
) {
  return execute(
    `INSERT INTO admin_audit_logs 
     (admin_id, action, resource_type, resource_id, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [adminId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]
  )
}

// Folder Permissions
export async function grantFolderPermission(
  folderId: string,
  adminId: string,
  grantedBy: string,
  permissionLevel: string = 'view'
) {
  return execute(
    `INSERT INTO admin_folder_permissions (folder_id, admin_id, granted_by, permission_level)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (folder_id, admin_id) DO UPDATE SET permission_level = $4`,
    [folderId, adminId, grantedBy, permissionLevel]
  )
}

export async function revokeFolderPermission(folderId: string, adminId: string) {
  return execute(
    `DELETE FROM admin_folder_permissions 
     WHERE folder_id = $1 AND admin_id = $2`,
    [folderId, adminId]
  )
}

export async function getFolderPermissions(folderId: string) {
  return query(
    `SELECT admin_id, permission_level, granted_by, created_at
     FROM admin_folder_permissions
     WHERE folder_id = $1`,
    [folderId]
  )
}
