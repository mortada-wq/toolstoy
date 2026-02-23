import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromptTestService } from '../PromptTestService';
import { Pool } from 'pg';

vi.mock('pg', () => ({
  Pool: vi.fn(),
}));

describe('PromptTestService', () => {
  let service: PromptTestService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
    };
    service = new PromptTestService(mockPool as Pool);
  });

  describe('generatePreview', () => {
    it('should create preview job with provided prompt', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'preview-1',
            character_id: 'char-123',
            emotion: 'idle',
            prompt_text: 'Test prompt',
            status: 'pending',
            created_by: 'admin',
            created_at: new Date(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        ],
      });

      const result = await service.generatePreview('char-123', 'idle', 'Test prompt', 'admin');

      expect(result.status).toBe('pending');
      expect(result.prompt_text).toBe('Test prompt');
      expect(result.character_id).toBe('char-123');
    });

    it('should fetch prompt from database if not provided', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ prompt_text: 'Database prompt' }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'preview-1',
              character_id: 'char-123',
              emotion: 'idle',
              prompt_text: 'Database prompt',
              status: 'pending',
              created_by: 'system',
              created_at: new Date(),
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          ],
        });

      const result = await service.generatePreview('char-123', 'idle', undefined, 'admin');

      expect(result.prompt_text).toBe('Database prompt');
    });

    it('should set expiration to 24 hours from creation', async () => {
      const beforeTime = Date.now();
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'preview-1',
            character_id: 'char-123',
            emotion: 'idle',
            prompt_text: 'Test',
            status: 'pending',
            created_by: 'admin',
            created_at: new Date(),
            expires_at: new Date(beforeTime + 24 * 60 * 60 * 1000),
          },
        ],
      });

      const result = await service.generatePreview('char-123', 'idle', 'Test', 'admin');

      const expiryTime = result.expires_at.getTime();
      const expectedMin = beforeTime + 24 * 60 * 60 * 1000 - 1000;
      const expectedMax = beforeTime + 24 * 60 * 60 * 1000 + 1000;

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMin);
      expect(expiryTime).toBeLessThanOrEqual(expectedMax);
    });

    it('should throw error when prompt not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.generatePreview('char-123', 'idle')).rejects.toThrow('No prompt found');
    });
  });

  describe('getPreviewStatus', () => {
    it('should return preview status', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'preview-1',
            status: 'completed',
            video_url: 'https://example.com/video.mp4',
            error: null,
            expires_at: new Date(),
            completed_at: new Date(),
          },
        ],
      });

      const result = await service.getPreviewStatus('preview-1');

      expect(result.status).toBe('completed');
      expect(result.video_url).toBe('https://example.com/video.mp4');
    });

    it('should throw error when preview not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getPreviewStatus('invalid')).rejects.toThrow('Preview not found');
    });
  });

  describe('cancelPreview', () => {
    it('should cancel pending preview', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await service.cancelPreview('preview-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE prompt_preview_jobs'),
        ['preview-1']
      );
    });

    it('should throw error when preview cannot be cancelled', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.cancelPreview('preview-1')).rejects.toThrow('Cannot cancel preview');
    });
  });

  describe('updatePreviewStatus', () => {
    it('should update preview with video URL', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'preview-1',
            status: 'completed',
            video_url: 'https://example.com/video.mp4',
            error: null,
            completed_at: new Date(),
          },
        ],
      });

      const result = await service.updatePreviewStatus(
        'preview-1',
        'completed',
        'https://example.com/video.mp4'
      );

      expect(result.status).toBe('completed');
      expect(result.video_url).toBe('https://example.com/video.mp4');
    });

    it('should update preview with error', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'preview-1',
            status: 'failed',
            video_url: null,
            error: 'Generation failed',
            completed_at: new Date(),
          },
        ],
      });

      const result = await service.updatePreviewStatus('preview-1', 'failed', undefined, 'Generation failed');

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Generation failed');
    });
  });

  describe('cleanupExpiredPreviews', () => {
    it('should delete expired previews', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 5 });

      const result = await service.cleanupExpiredPreviews();

      expect(result).toBe(5);
    });

    it('should use provided cutoff date', async () => {
      const cutoffDate = new Date('2024-01-01');
      mockPool.query.mockResolvedValueOnce({ rowCount: 3 });

      await service.cleanupExpiredPreviews(cutoffDate);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM prompt_preview_jobs'),
        [cutoffDate]
      );
    });
  });

  describe('getCharacterPreviews', () => {
    it('should return active previews for character', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'preview-1',
            character_id: 'char-123',
            emotion: 'idle',
            status: 'completed',
            created_at: new Date(),
          },
          {
            id: 'preview-2',
            character_id: 'char-123',
            emotion: 'excited',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await service.getCharacterPreviews('char-123');

      expect(result).toHaveLength(2);
      expect(result[0].character_id).toBe('char-123');
    });
  });
});
