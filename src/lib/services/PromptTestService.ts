import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface PreviewVideo {
  id: string;
  character_id: string;
  emotion: string;
  prompt_text: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
  created_by: string;
  created_at: Date;
  expires_at: Date;
  completed_at?: Date;
}

export interface PreviewStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
  expires_at: Date;
  completed_at?: Date;
}

export class PromptTestService {
  constructor(private pool: Pool) {}

  /**
   * Generate preview video for testing
   */
  async generatePreview(
    characterId: string,
    emotion: string,
    promptText?: string,
    createdBy?: string
  ): Promise<PreviewVideo> {
    const previewId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // If no prompt provided, fetch from database
    let finalPromptText = promptText;
    if (!finalPromptText) {
      const result = await this.pool.query(
        `SELECT prompt_text FROM emotional_prompts 
         WHERE character_id = $1 AND emotion = $2 AND deleted_at IS NULL
         UNION ALL
         SELECT prompt_text FROM global_emotional_prompts WHERE emotion = $2
         LIMIT 1`,
        [characterId, emotion]
      );

      if (result.rows.length === 0) {
        throw new Error(`No prompt found for character ${characterId} and emotion ${emotion}`);
      }

      finalPromptText = result.rows[0].prompt_text;
    }

    // Create preview job record
    const insertResult = await this.pool.query(
      `INSERT INTO prompt_preview_jobs 
       (id, character_id, emotion, prompt_text, status, created_by, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [previewId, characterId, emotion, finalPromptText, 'pending', createdBy || 'system', now, expiresAt]
    );

    return insertResult.rows[0];
  }

  /**
   * Get preview status
   */
  async getPreviewStatus(previewId: string): Promise<PreviewStatus> {
    const result = await this.pool.query(
      `SELECT id, status, video_url, error, expires_at, completed_at 
       FROM prompt_preview_jobs WHERE id = $1`,
      [previewId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Preview not found: ${previewId}`);
    }

    return result.rows[0];
  }

  /**
   * Cancel preview generation
   */
  async cancelPreview(previewId: string): Promise<void> {
    const result = await this.pool.query(
      `UPDATE prompt_preview_jobs 
       SET status = 'failed', error = 'Cancelled by user'
       WHERE id = $1 AND status IN ('pending', 'processing')`,
      [previewId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Cannot cancel preview: ${previewId}`);
    }
  }

  /**
   * Update preview with completion status
   */
  async updatePreviewStatus(
    previewId: string,
    status: 'processing' | 'completed' | 'failed',
    videoUrl?: string,
    error?: string
  ): Promise<PreviewVideo> {
    const result = await this.pool.query(
      `UPDATE prompt_preview_jobs 
       SET status = $1, video_url = $2, error = $3, completed_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, videoUrl || null, error || null, previewId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Preview not found: ${previewId}`);
    }

    return result.rows[0];
  }

  /**
   * Clean up expired previews
   */
  async cleanupExpiredPreviews(olderThan?: Date): Promise<number> {
    const cutoffDate = olderThan || new Date();

    const result = await this.pool.query(
      `DELETE FROM prompt_preview_jobs 
       WHERE expires_at < $1`,
      [cutoffDate]
    );

    return result.rowCount || 0;
  }

  /**
   * Get all active previews for a character
   */
  async getCharacterPreviews(characterId: string): Promise<PreviewVideo[]> {
    const result = await this.pool.query(
      `SELECT * FROM prompt_preview_jobs 
       WHERE character_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [characterId]
    );

    return result.rows;
  }
}
