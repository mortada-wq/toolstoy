import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmotionalPromptsService } from '../EmotionalPromptsService';
import { Pool } from 'pg';

// Mock Pool
vi.mock('pg', () => ({
  Pool: vi.fn(),
}));

describe('EmotionalPromptsService', () => {
  let service: EmotionalPromptsService;
  let mockPool: any;
  let mockCache: Map<string, any>;

  beforeEach(() => {
    mockCache = new Map();
    mockPool = {
      query: vi.fn(),
      connect: vi.fn(),
    };
    service = new EmotionalPromptsService(mockPool as Pool, mockCache);
  });

  describe('getCharacterPrompts', () => {
    it('should return character prompts with global defaults', async () => {
      const characterId = 'char-123';
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            emotion: 'idle',
            id: 'prompt-1',
            prompt_text: 'Character idle prompt',
            version: 1,
            created_by: 'admin',
            created_at: new Date(),
            updated_by: 'admin',
            updated_at: new Date(),
            global_prompt_text: 'Global idle prompt',
            global_version: 1,
          },
          {
            emotion: 'excited',
            id: null,
            prompt_text: null,
            global_prompt_text: 'Global excited prompt',
            global_version: 1,
          },
        ],
      });

      const result = await service.getCharacterPrompts(characterId);

      expect(result.character_id).toBe(characterId);
      expect(result.prompts).toHaveLength(2);
      expect(result.prompts[0].is_global).toBe(false);
      expect(result.prompts[1].is_global).toBe(true);
    });

    it('should cache results', async () => {
      const characterId = 'char-123';
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await service.getCharacterPrompts(characterId);
      await service.getCharacterPrompts(characterId);

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPrompt', () => {
    it('should return character-specific prompt when available', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'prompt-1',
            character_id: 'char-123',
            emotion: 'idle',
            prompt_text: 'Character idle prompt',
            version: 1,
          },
        ],
      });

      const result = await service.getPrompt('char-123', 'idle');

      expect(result.prompt_text).toBe('Character idle prompt');
      expect(result.id).toBe('prompt-1');
    });

    it('should return global prompt when character-specific not found', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Character-specific query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'global-1',
              emotion: 'idle',
              prompt_text: 'Global idle prompt',
              version: 1,
            },
          ],
        }); // Global query

      const result = await service.getPrompt('char-123', 'idle');

      expect(result.prompt_text).toBe('Global idle prompt');
    });

    it('should throw error for invalid emotion', async () => {
      await expect(service.getPrompt('char-123', 'invalid')).rejects.toThrow('Invalid emotion');
    });

    it('should throw error when no prompt found', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Character-specific
        .mockResolvedValueOnce({ rows: [] }); // Global

      await expect(service.getPrompt('char-123', 'idle')).rejects.toThrow('No prompt found');
    });
  });

  describe('updatePrompt', () => {
    it('should create new prompt when none exists', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      mockPool.connect.mockResolvedValueOnce(mockClient);

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // SELECT existing
        .mockResolvedValueOnce(undefined) // INSERT new
        .mockResolvedValueOnce(undefined) // COMMIT
        .mockResolvedValueOnce({ rows: [{ prompt_text: 'New prompt' }] }); // getPrompt

      mockPool.query.mockResolvedValueOnce({ rows: [{ prompt_text: 'New prompt' }] });

      const result = await service.updatePrompt('char-123', 'idle', 'New prompt', 'admin');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error for empty prompt text', async () => {
      await expect(service.updatePrompt('char-123', 'idle', '', 'admin')).rejects.toThrow(
        'Prompt text cannot be empty'
      );
    });

    it('should throw error for invalid emotion', async () => {
      await expect(service.updatePrompt('char-123', 'invalid', 'text', 'admin')).rejects.toThrow(
        'Invalid emotion'
      );
    });
  });

  describe('getResolvedPrompt', () => {
    it('should substitute variables in prompt', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Character-specific
        .mockResolvedValueOnce({
          rows: [
            {
              prompt_text: 'Hello {character_name}, you are {emotion}',
            },
          ],
        }); // Global

      const result = await service.getResolvedPrompt('char-123', 'idle', {
        character_name: 'Alice',
      });

      expect(result).toContain('Hello Alice');
      expect(result).toContain('you are idle');
    });

    it('should handle missing variables gracefully', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              prompt_text: 'Hello {character_name}',
            },
          ],
        });

      const result = await service.getResolvedPrompt('char-123', 'idle');

      expect(result).toContain('Hello Character');
    });
  });

  describe('getPromptVersions', () => {
    it('should return version history in descending order', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { version: 3, prompt_text: 'Version 3', created_by: 'admin', created_at: new Date() },
          { version: 2, prompt_text: 'Version 2', created_by: 'admin', created_at: new Date() },
          { version: 1, prompt_text: 'Version 1', created_by: 'admin', created_at: new Date() },
        ],
      });

      const result = await service.getPromptVersions('char-123', 'idle');

      expect(result).toHaveLength(3);
      expect(result[0].version).toBe(3);
      expect(result[2].version).toBe(1);
    });
  });
});
