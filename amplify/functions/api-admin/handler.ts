import { APIGatewayProxyHandler } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import * as db from './database'

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

function getAdminId(event: any): string | null {
  return event.requestContext?.authorizer?.claims?.sub || null
}

function getClientIp(event: any): string {
  return event.requestContext?.identity?.sourceIp || 'unknown'
}

function getUserAgent(event: any): string {
  return event.headers?.['user-agent'] || 'unknown'
}

// GET /api/admin/media-folders
export const getMediaFolders: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    // TODO: Query database for folders created by or shared with adminId
    const folders: MediaFolder[] = []

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ folders }),
    }
  } catch (error) {
    console.error('Error fetching folders:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch folders' }),
    }
  }
}

// POST /api/admin/media-folders
export const createMediaFolder: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Folder name is required' }),
      }
    }

    const folderId = uuidv4()
    const now = new Date().toISOString()

    // TODO: Insert into admin_media_folders table
    const folder: MediaFolder = {
      id: folderId,
      name,
      description,
      createdBy: adminId,
      createdAt: now,
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ folder }),
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create folder' }),
    }
  }
}

// DELETE /api/admin/media-folders/:id
export const deleteMediaFolder: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const folderId = event.pathParameters?.id
    if (!folderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Folder ID is required' }),
      }
    }

    // TODO: Verify ownership and delete folder and all assets
    // TODO: Delete assets from S3

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('Error deleting folder:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete folder' }),
    }
  }
}

// GET /api/admin/media-folders/:id/assets
export const getMediaAssets: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const folderId = event.pathParameters?.id
    if (!folderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Folder ID is required' }),
      }
    }

    // TODO: Query database for assets in folder
    const assets: MediaAsset[] = []

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ assets }),
    }
  } catch (error) {
    console.error('Error fetching assets:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch assets' }),
    }
  }
}

// POST /api/admin/media-folders/:id/assets
export const uploadMediaAsset: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const folderId = event.pathParameters?.id
    if (!folderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Folder ID is required' }),
      }
    }

    // TODO: Parse multipart form data
    // TODO: Validate file type and size
    // TODO: Upload to S3
    // TODO: Store metadata in database

    const assetId = uuidv4()
    const now = new Date().toISOString()

    const asset: MediaAsset = {
      id: assetId,
      folderId,
      assetName: 'uploaded-file',
      assetUrl: 's3://bucket/path',
      assetType: 'image/jpeg',
      createdBy: adminId,
      createdAt: now,
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ asset }),
    }
  } catch (error) {
    console.error('Error uploading asset:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to upload asset' }),
    }
  }
}

// DELETE /api/admin/media-folders/:id/assets/:assetId
export const deleteMediaAsset: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const folderId = event.pathParameters?.id
    const assetId = event.pathParameters?.assetId

    if (!folderId || !assetId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Folder ID and Asset ID are required' }),
      }
    }

    // TODO: Delete from S3
    // TODO: Delete from database

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('Error deleting asset:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete asset' }),
    }
  }
}

// POST /api/admin/test-generation
export const testGeneration: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { prompt, productImage, characterType, vibeTags } = body

    // TODO: Invoke Soul Engine with test mode
    // TODO: Store in admin_test_generations table
    // TODO: Return results without saving to production

    const jobId = uuidv4()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jobId,
        status: 'processing',
        estimatedTime: 30,
      }),
    }
  } catch (error) {
    console.error('Error in test generation:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate' }),
    }
  }
}

// POST /api/admin/production-generation
export const productionGeneration: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { prompt, productImage, characterType, vibeTags, confirmed } = body

    if (!confirmed) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Production generation requires confirmation' }),
      }
    }

    // TODO: Invoke Soul Engine with production mode
    // TODO: Store in generation_jobs table
    // TODO: Save results to production database

    const jobId = uuidv4()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jobId,
        status: 'processing',
        estimatedTime: 30,
      }),
    }
  } catch (error) {
    console.error('Error in production generation:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate' }),
    }
  }
}

// GET /api/admin/generation-history
export const getGenerationHistory: APIGatewayProxyHandler = async (event) => {
  try {
    const adminId = event.requestContext.authorizer?.claims?.sub
    if (!adminId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const mode = event.queryStringParameters?.mode
    // TODO: Query database for generations
    // TODO: Filter by mode if provided
    // TODO: Calculate total costs

    const generations = []
    const totalTestCost = 0
    const totalProductionCost = 0

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        generations,
        totalTestCost,
        totalProductionCost,
      }),
    }
  } catch (error) {
    console.error('Error fetching generation history:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch history' }),
    }
  }
}
