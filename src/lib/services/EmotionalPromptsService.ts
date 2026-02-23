import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface Prompt {
  id: string;
  character_id: string;
  emotion: string;
  prompt_text: string;
  version: number;
  is_global_override: boolean;
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

export interface GlobalPrompt {
  id: string;
  emotion: string;
  prompt_text: string;
  version: number;
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  character_id: string;
  emotion: string;
  prompt_text: string;
  version: number;
  created_by: string;
  created_at: Date;
  change_reason?: string;
}

export interface CharacterPrompts {
  character_id: string;
  prompts: Array<Prompt & { is_global: boolean }>;
}

const VALID_EMOTIONS = ['idle', 'excited', 'sad', 'angry', 'confused', 'happy', 'surprised', 'neutral'];

export class EmotionalPromptsService {
  constructor(private pool: Pool, private cache?: Map<string, any>) {}

  /**
   * Get all emotional prompts for a character (character-specific + global defaults)
   */
  async getCharacterPrompts(characterId: string): Promise<CharacterPrompts> {
    const cacheKey = `char_prompts:${characterId}`;
    if (this.cache?.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.pool.query(
      `SELECT ep.*, gep.prompt_text as global_prompt_text, gep.version as global_version
       FROM (SELECT DISTINCT emotion FROM global_emotional_prompts) emotions
       LEFT JOIN emotional_prompts ep ON ep.character_id = $1 AND ep.emotion = emotions.emotion AND ep.deleted_at IS NULL
       LEFT JOIN global_emotional_prompts gep ON gep.emotion = emotions.emotion
       ORDER BY emotions.emotion`,
      [characterId]
    );

    const prompts = result.rows.map(row => ({
      id: row.id || uuidv4(),
      character_id: characterId,
      emotion: row.emotion,
      prompt_text: row.prompt_text || row.global_prompt_text,
      version: row.version || row.global_version || 1,
      is_global_override: !!row.id,
      is_global: !row.id,
      created_by: row.created_by || 'system',
      created_at: row.created_at || new Date(),
      updated_by: row.updated_by || 'system',
      updated_at: row.updated_at || new Date(),
    }));

    const response: CharacterPrompts = { character_id: characterId, prompts };
    this.cache?.set(cacheKey, response);
    return response;
  }

  /**
   * Get specific emotional prompt (character-specific or global default)
   */
  async getPrompt(characterId: string, emotion: string): Promise<Prompt | GlobalPrompt> {
    if (!VALID_EMOTIONS.includes(emotion)) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }

    const cacheKey = `prompt:${characterId}:${emotion}`;
    if (this.cache?.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Try character-specific first
    const charResult = await this.pool.query(
      `SELECT * FROM emotional_prompts 
       WHERE character_id = $1 AND emotion = $2 AND deleted_at IS NULL`,
      [characterId, emotion]
    );

    if (charResult.rows.length > 0) {
      const prompt = charResult.rows[0];
      this.cache?.set(cacheKey, prompt);
      return prompt;
    }

    // Fall back to global default
    const globalResult = await this.pool.query(
      `SELECT * FROM global_emotional_prompts WHERE emotion = $1`,
      [emotion]
    );

    if (globalResult.rows.length === 0) {
      throw new Error(`No prompt found for emotion: ${emotion}`);
    }

    const prompt = globalResult.rows[0];
    this.cache?.set(cacheKey, prompt);
    return prompt;
  }

  /**
   * Update emotional prompt for character (creates new version)
   */
  async updatePrompt(
    characterId: string,
    emotion: string,
    promptText: string,
    updatedBy: string
  ): Promise<Prompt> {
    if (!VALID_EMOTIONS.includes(emotion)) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }
    if (!promptText || promptText.trim() === '') {
      throw new Error('Prompt text cannot be empty');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get or create prompt record
      let promptResult = await client.query(
        `SELECT * FROM emotional_prompts 
         WHERE character_id = $1 AND emotion = $2 AND deleted_at IS NULL`,
        [characterId, emotion]
      );

      let promptId: string;
      let currentVersion: number;

      if (promptResult.rows.length === 0) {
        // Create new prompt
        promptId = uuidv4();
        currentVersion = 1;
        await client.query(
          `INSERT INTO emotional_prompts 
           (id, character_id, emotion, prompt_text, version, is_global_override, created_by, updated_by)
           VALUES ($1, $2, $3, $4, $5, true, $6, $7)`,
          [promptId, characterId, emotion, promptText, currentVersion, updatedBy, updatedBy]
        );
      } else {
        // Update existing prompt
        const prompt = promptResult.rows[0];
        promptId = prompt.id;
        currentVersion = prompt.version + 1;

        // Create version record for old version
        await client.query(
          `INSERT INTO prompt_versions 
           (id, prompt_id, character_id, emotion, prompt_text, version, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), promptId, characterId, emotion, prompt.prompt_text, prompt.version, updatedBy]
        );

        // Update prompt
        await client.query(
          `UPDATE emotional_prompts 
           SET prompt_text = $1, version = $2, updated_by = $3, updated_at = NOW()
           WHERE id = $4`,
          [promptText, currentVersion, updatedBy, promptId]
        );
      }

      await client.query('COMMIT');

      // Invalidate cache
      this.cache?.delete(`prompt:${characterId}:${emotion}`);
      this.cache?.delete(`char_prompts:${characterId}`);

      return this.getPrompt(characterId, emotion) as Promise<Prompt>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get global default prompt for emotion
   */
  async getGlobalPrompt(emotion: string): Promise<GlobalPrompt> {
    if (!VALID_EMOTIONS.includes(emotion)) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }

    const result = await this.pool.query(
      `SELECT * FROM global_emotional_prompts WHERE emotion = $1`,
      [emotion]
    );

    if (result.rows.length === 0) {
      throw new Error(`No global prompt found for emotion: ${emotion}`);
    }

    return result.rows[0];
  }

  /**
   * Update global default prompt
   */
  async updateGlobalPrompt(
    emotion: string,
    promptText: string,
    updatedBy: string
  ): Promise<GlobalPrompt> {
    if (!VALID_EMOTIONS.includes(emotion)) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }
    if (!promptText || promptText.trim() === '') {
      throw new Error('Prompt text cannot be empty');
    }

    const result = await this.pool.query(
      `UPDATE global_emotional_prompts 
       SET prompt_text = $1, version = version + 1, updated_by = $2, updated_at = NOW()
       WHERE emotion = $3
       RETURNING *`,
      [promptText, updatedBy, emotion]
    );

    if (result.rows.length === 0) {
      throw new Error(`No global prompt found for emotion: ${emotion}`);
    }

    // Invalidate cache for all characters
    this.cache?.clear();

    return result.rows[0];
  }

  /**
   * Get version history for prompt
   */
  async getPromptVersions(characterId: string, emotion: string): Promise<PromptVersion[]> {
    const result = await this.pool.query(
      `SELECT pv.* FROM prompt_versions pv
       JOIN emotional_prompts ep ON ep.id = pv.prompt_id
       WHERE ep.character_id = $1 AND pv.emotion = $2
       ORDER BY pv.version DESC`,
      [characterId, emotion]
    );

    return result.rows;
  }

  /**
   * Revert prompt to specific version
   */
  async revertPrompt(
    characterId: string,
    emotion: string,
    versionId: string,
    revertedBy: string
  ): Promise<Prompt> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get target version
      const versionResult = await client.query(
        `SELECT * FROM prompt_versions WHERE id = $1`,
        [versionId]
      );

      if (versionResult.rows.length === 0) {
        throw new Error('Version not found');
      }

      const targetVersion = versionResult.rows[0];

      // Get current prompt
      const promptResult = await client.query(
        `SELECT * FROM emotional_prompts 
         WHERE character_id = $1 AND emotion = $2 AND deleted_at IS NULL`,
        [characterId, emotion]
      );

      if (promptResult.rows.length === 0) {
        throw new Error('Prompt not found');
      }

      const currentPrompt = promptResult.rows[0];

      // Create version record for current version
      await client.query(
        `INSERT INTO prompt_versions 
         (id, prompt_id, character_id, emotion, prompt_text, version, created_by, change_reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          currentPrompt.id,
          characterId,
          emotion,
          currentPrompt.prompt_text,
          currentPrompt.version,
          revertedBy,
          `Reverted to version ${targetVersion.version}`,
        ]
      );

      // Update prompt to target version
      const newVersion = currentPrompt.version + 1;
      await client.query(
        `UPDATE emotional_prompts 
         SET prompt_text = $1, version = $2, updated_by = $3, updated_at = NOW()
         WHERE id = $4`,
        [targetVersion.prompt_text, newVersion, revertedBy, currentPrompt.id]
      );

      await client.query('COMMIT');

      // Invalidate cache
      this.cache?.delete(`prompt:${characterId}:${emotion}`);
      this.cache?.delete(`char_prompts:${characterId}`);

      return this.getPrompt(characterId, emotion) as Promise<Prompt>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get prompt with variable substitution
   */
  async getResolvedPrompt(
    characterId: string,
    emotion: string,
    variables?: Record<string, string>
  ): Promise<string> {
    const prompt = await this.getPrompt(characterId, emotion);
    let resolvedText = prompt.prompt_text;

    // Default variables
    const defaultVars = {
      character_name: variables?.character_name || 'Character',
      emotion: emotion,
      timestamp: new Date().toISOString(),
      user_id: variables?.user_id || 'unknown',
    };

    // Merge with provided variables
    const allVars = { ...defaultVars, ...variables };

    // Replace variables
    Object.entries(allVars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      resolvedText = resolvedText.replace(regex, value);
    });

    return resolvedText;
  }
}
