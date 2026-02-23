import { Router, Request, Response } from 'express';
import { EmotionalPromptsService } from '../services/EmotionalPromptsService';
import { PromptTestService } from '../services/PromptTestService';
import { Pool } from 'pg';

export function createEmotionalPromptsRouter(pool: Pool): Router {
  const router = Router();
  const promptsService = new EmotionalPromptsService(pool);
  const testService = new PromptTestService(pool);

  // Middleware to verify admin authorization
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  /**
   * GET /api/admin/characters/:id/emotional-prompts
   * Fetch all emotional prompts for character
   */
  router.get('/:id/emotional-prompts', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prompts = await promptsService.getCharacterPrompts(id);
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/admin/characters/:id/emotional-prompts/:emotion
   * Create emotional prompt for character
   */
  router.post('/:id/emotional-prompts/:emotion', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id, emotion } = req.params;
      const { prompt_text, change_reason } = req.body;
      const userId = (req as any).user?.id || 'system';

      if (!prompt_text) {
        return res.status(400).json({ error: 'prompt_text is required' });
      }

      const prompt = await promptsService.updatePrompt(id, emotion, prompt_text, userId);
      res.status(201).json(prompt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/admin/characters/:id/emotional-prompts/:emotion
   * Update emotional prompt for character
   */
  router.put('/:id/emotional-prompts/:emotion', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id, emotion } = req.params;
      const { prompt_text, change_reason } = req.body;
      const userId = (req as any).user?.id || 'system';

      if (!prompt_text) {
        return res.status(400).json({ error: 'prompt_text is required' });
      }

      const prompt = await promptsService.updatePrompt(id, emotion, prompt_text, userId);
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/admin/characters/:id/emotional-prompts/:emotion/versions
   * Retrieve version history for prompt
   */
  router.get('/:id/emotional-prompts/:emotion/versions', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id, emotion } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const versions = await promptsService.getPromptVersions(id, emotion);
      const paginated = versions.slice(Number(offset), Number(offset) + Number(limit));

      res.json({
        versions: paginated,
        total: versions.length,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/admin/characters/:id/emotional-prompts/:emotion/revert
   * Revert prompt to specific version
   */
  router.post('/:id/emotional-prompts/:emotion/revert', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id, emotion } = req.params;
      const { version_id } = req.body;
      const userId = (req as any).user?.id || 'system';

      if (!version_id) {
        return res.status(400).json({ error: 'version_id is required' });
      }

      const prompt = await promptsService.revertPrompt(id, emotion, version_id, userId);
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/admin/characters/:id/emotional-prompts/:emotion/test
   * Generate preview video for testing
   */
  router.post('/:id/emotional-prompts/:emotion/test', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id, emotion } = req.params;
      const { prompt_text } = req.body;
      const userId = (req as any).user?.id || 'system';

      const preview = await testService.generatePreview(id, emotion, prompt_text, userId);
      res.status(201).json({
        preview_id: preview.id,
        status: preview.status,
        expires_at: preview.expires_at,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/**
 * Create global prompts router
 */
export function createGlobalPromptsRouter(pool: Pool): Router {
  const router = Router();
  const promptsService = new EmotionalPromptsService(pool);

  const requireAdmin = (req: Request, res: Response, next: Function) => {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  /**
   * GET /api/admin/global-prompts/:emotion
   * Retrieve global default prompt for emotion
   */
  router.get('/:emotion', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { emotion } = req.params;
      const prompt = await promptsService.getGlobalPrompt(emotion);
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/admin/global-prompts/:emotion
   * Update global default prompt
   */
  router.put('/:emotion', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { emotion } = req.params;
      const { prompt_text } = req.body;
      const userId = (req as any).user?.id || 'system';

      if (!prompt_text) {
        return res.status(400).json({ error: 'prompt_text is required' });
      }

      const prompt = await promptsService.updateGlobalPrompt(emotion, prompt_text, userId);
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
