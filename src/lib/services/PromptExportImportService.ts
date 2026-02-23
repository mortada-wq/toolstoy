import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface ExportOptions {
  format?: 'json' | 'csv';
  include_versions?: boolean;
}

export interface ImportOptions {
  conflict_resolution?: 'overwrite' | 'skip' | 'merge';
}

export interface ExportResult {
  export_id: string;
  file_url: string;
  created_at: Date;
  format: string;
}

export interface ImportResult {
  import_id: string;
  status: 'pending' | 'completed' | 'failed';
  success_count: number;
  conflict_count: number;
  error_count: number;
  errors?: string[];
}

export interface ImportPreview {
  prompts: Array<{
    character_id: string;
    emotion: string;
    action: 'create' | 'update' | 'conflict';
    current_version?: number;
    import_version?: number;
  }>;
}

export interface Conflict {
  character_id: string;
  emotion: string;
  current_version: number;
  import_version: number;
}

export class PromptExportImportService {
  constructor(private pool: Pool) {}

  /**
   * Export all prompts to JSON/CSV
   */
  async exportPrompts(options: ExportOptions = {}): Promise<ExportResult> {
    const format = options.format || 'json';
    const includeVersions = options.include_versions !== false;

    // Fetch all prompts
    const promptsResult = await this.pool.query(
      `SELECT * FROM emotional_prompts WHERE deleted_at IS NULL ORDER BY character_id, emotion`
    );

    const prompts = promptsResult.rows;

    // Fetch versions if requested
    let versions: any[] = [];
    if (includeVersions) {
      const versionsResult = await this.pool.query(
        `SELECT * FROM prompt_versions ORDER BY prompt_id, version`
      );
      versions = versionsResult.rows;
    }

    // Format data
    let fileContent: string;
    if (format === 'json') {
      fileContent = JSON.stringify(
        {
          export_date: new Date().toISOString(),
          prompts,
          versions: includeVersions ? versions : [],
        },
        null,
        2
      );
    } else {
      // CSV format
      const headers = ['character_id', 'emotion', 'prompt_text', 'version'];
      const rows = prompts.map(p => [p.character_id, p.emotion, `"${p.prompt_text}"`, p.version]);
      fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // In a real implementation, this would upload to S3 and return a URL
    const exportId = uuidv4();
    const fileUrl = `/exports/${exportId}.${format === 'json' ? 'json' : 'csv'}`;

    return {
      export_id: exportId,
      file_url: fileUrl,
      created_at: new Date(),
      format,
    };
  }

  /**
   * Validate import file
   */
  async validateImportFile(fileContent: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const data = JSON.parse(fileContent);

      if (!Array.isArray(data.prompts)) {
        errors.push('Invalid format: prompts must be an array');
      }

      for (const prompt of data.prompts || []) {
        if (!prompt.character_id) errors.push('Missing character_id');
        if (!prompt.emotion) errors.push('Missing emotion');
        if (!prompt.prompt_text) errors.push('Missing prompt_text');
        if (!['idle', 'excited', 'sad', 'angry', 'confused', 'happy', 'surprised', 'neutral'].includes(prompt.emotion)) {
          errors.push(`Invalid emotion: ${prompt.emotion}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [`Invalid JSON: ${error.message}`],
      };
    }
  }

  /**
   * Get import preview
   */
  async getImportPreview(fileContent: string): Promise<ImportPreview> {
    const data = JSON.parse(fileContent);
    const preview: ImportPreview = { prompts: [] };

    for (const prompt of data.prompts || []) {
      // Check if prompt already exists
      const existing = await this.pool.query(
        `SELECT version FROM emotional_prompts 
         WHERE character_id = $1 AND emotion = $2 AND deleted_at IS NULL`,
        [prompt.character_id, prompt.emotion]
      );

      if (existing.rows.length > 0) {
        preview.prompts.push({
          character_id: prompt.character_id,
          emotion: prompt.emotion,
          action: 'conflict',
          current_version: existing.rows[0].version,
          import_version: prompt.version,
        });
      } else {
        preview.prompts.push({
          character_id: prompt.character_id,
          emotion: prompt.emotion,
          action: 'create',
          import_version: prompt.version,
        });
      }
    }

    return preview;
  }

  /**
   * Import prompts from file
   */
  async importPrompts(fileContent: string, options: ImportOptions = {}): Promise<ImportResult> {
    const importId = uuidv4();
    const conflictResolution = options.conflict_resolution || 'skip';

    // Validate file
    const validation = await this.validateImportFile(fileContent);
    if (!validation.valid) {
      return {
        import_id: importId,
        status: 'failed',
        success_count: 0,
        conflict_count: 0,
        error_count: validation.errors.length,
        errors: validation.errors,
      };
    }

    const data = JSON.parse(fileContent);
    let successCount = 0;
    let conflictCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const prompt of data.prompts || []) {
        try {
          // Check if prompt exists
          const existing = await client.query(
            `SELECT * FROM emotional_prompts 
             WHERE character_id = $1 AND emotion = $2 AND deleted_at IS NULL`,
            [prompt.character_id, prompt.emotion]
          );

          if (existing.rows.length > 0) {
            conflictCount++;

            if (conflictResolution === 'overwrite') {
              // Create version record for old version
              const oldPrompt = existing.rows[0];
              await client.query(
                `INSERT INTO prompt_versions 
                 (id, prompt_id, character_id, emotion, prompt_text, version, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  uuidv4(),
                  oldPrompt.id,
                  prompt.character_id,
                  prompt.emotion,
                  oldPrompt.prompt_text,
                  oldPrompt.version,
                  'import',
                ]
              );

              // Update prompt
              await client.query(
                `UPDATE emotional_prompts 
                 SET prompt_text = $1, version = $2, updated_by = $3, updated_at = NOW()
                 WHERE id = $4`,
                [prompt.prompt_text, oldPrompt.version + 1, 'import', oldPrompt.id]
              );

              successCount++;
            }
            // else skip
          } else {
            // Create new prompt
            await client.query(
              `INSERT INTO emotional_prompts 
               (id, character_id, emotion, prompt_text, version, is_global_override, created_by, updated_by)
               VALUES ($1, $2, $3, $4, $5, true, $6, $7)`,
              [
                uuidv4(),
                prompt.character_id,
                prompt.emotion,
                prompt.prompt_text,
                prompt.version || 1,
                'import',
                'import',
              ]
            );

            successCount++;
          }
        } catch (error: any) {
          errorCount++;
          errors.push(`Failed to import ${prompt.character_id}/${prompt.emotion}: ${error.message}`);
        }
      }

      // Import versions if provided
      if (data.versions && Array.isArray(data.versions)) {
        for (const version of data.versions) {
          try {
            await client.query(
              `INSERT INTO prompt_versions 
               (id, prompt_id, character_id, emotion, prompt_text, version, created_by)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (prompt_id, version) DO NOTHING`,
              [
                uuidv4(),
                version.prompt_id,
                version.character_id,
                version.emotion,
                version.prompt_text,
                version.version,
                'import',
              ]
            );
          } catch (error) {
            // Ignore version import errors
          }
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return {
      import_id: importId,
      status: 'completed',
      success_count: successCount,
      conflict_count: conflictCount,
      error_count: errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Resolve conflicts
   */
  async resolveConflicts(conflicts: Conflict[], resolution: 'overwrite' | 'skip' | 'merge'): Promise<void> {
    // Implementation would handle conflict resolution
    // For now, this is a placeholder
  }
}
