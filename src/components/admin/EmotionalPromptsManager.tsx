import React, { useState, useEffect } from 'react';

interface Character {
  id: string;
  name: string;
  image_url?: string;
}

interface Prompt {
  id: string;
  character_id: string;
  emotion: string;
  prompt_text: string;
  version: number;
  is_global: boolean;
}

interface CharacterListProps {
  characters: Character[];
  selectedCharacterId?: string;
  onSelectCharacter: (characterId: string) => void;
}

/**
 * Character selection component
 */
export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  selectedCharacterId,
  onSelectCharacter,
}) => {
  return (
    <div className="character-list">
      <h2>Characters</h2>
      <div className="character-grid">
        {characters.map(character => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacterId === character.id ? 'selected' : ''}`}
            onClick={() => onSelectCharacter(character.id)}
          >
            {character.image_url && (
              <img src={character.image_url} alt={character.name} className="character-thumbnail" />
            )}
            <p className="character-name">{character.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EmotionalStatesListProps {
  characterId: string;
  prompts: Prompt[];
  selectedEmotion?: string;
  onSelectEmotion: (emotion: string) => void;
}

/**
 * Emotional states list component
 */
export const EmotionalStatesList: React.FC<EmotionalStatesListProps> = ({
  _characterId,
  prompts,
  selectedEmotion,
  onSelectEmotion,
}) => {
  const emotions = ['idle', 'excited', 'sad', 'angry', 'confused', 'happy', 'surprised', 'neutral'];

  return (
    <div className="emotional-states-list">
      <h2>Emotional States</h2>
      <div className="emotions-grid">
        {emotions.map(emotion => {
          const prompt = prompts.find(p => p.emotion === emotion);
          const isGlobal = prompt?.is_global ?? true;

          return (
            <div
              key={emotion}
              className={`emotion-card ${selectedEmotion === emotion ? 'selected' : ''}`}
              onClick={() => onSelectEmotion(emotion)}
            >
              <div className="emotion-header">
                <h3>{emotion}</h3>
                {isGlobal && <span className="badge-global">Global</span>}
                {!isGlobal && <span className="badge-custom">Custom</span>}
              </div>
              <p className="emotion-preview">{prompt?.prompt_text?.substring(0, 100)}...</p>
              <p className="emotion-version">v{prompt?.version || 1}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PromptEditorProps {
  characterId: string;
  emotion: string;
  prompt: Prompt | null;
  onSave: (promptText: string) => Promise<void>;
  onTest: (promptText: string) => Promise<void>;
  onShowVersions: () => void;
  loading?: boolean;
}

/**
 * Prompt editor component
 */
export const PromptEditor: React.FC<PromptEditorProps> = ({
  _characterId,
  emotion,
  prompt,
  onSave,
  onTest,
  onShowVersions,
  loading = false,
}) => {
  const [promptText, setPromptText] = useState(prompt?.prompt_text || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setPromptText(prompt?.prompt_text || '');
  }, [prompt]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(promptText);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTest(promptText);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="prompt-editor">
      <div className="editor-header">
        <h2>
          {emotion} Prompt {prompt && !prompt.is_global && '(Custom)'}
        </h2>
        <p className="editor-version">Version {prompt?.version || 1}</p>
      </div>

      <div className="editor-content">
        <div className="variable-guide">
          <h4>Available Variables</h4>
          <ul>
            <li>
              <code>{'{'} character_name {'}'}</code> - Character name
            </li>
            <li>
              <code>{'{'} emotion {'}'}</code> - Current emotion
            </li>
            <li>
              <code>{'{'} timestamp {'}'}</code> - Current timestamp
            </li>
            <li>
              <code>{'{'} user_id {'}'}</code> - User ID
            </li>
          </ul>
        </div>

        <textarea
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          placeholder="Enter prompt text..."
          className="prompt-textarea"
          rows={8}
          disabled={loading}
        />
      </div>

      <div className="editor-actions">
        <button onClick={handleSave} disabled={isSaving || loading} className="btn-primary">
          {isSaving ? 'Saving...' : 'Save Prompt'}
        </button>
        <button onClick={handleTest} disabled={isTesting || loading} className="btn-secondary">
          {isTesting ? 'Testing...' : 'Test Preview'}
        </button>
        <button onClick={onShowVersions} disabled={loading} className="btn-secondary">
          Version History
        </button>
      </div>
    </div>
  );
};

interface VersionHistoryProps {
  versions: Array<{
    id: string;
    version: number;
    prompt_text: string;
    created_by: string;
    created_at: string;
  }>;
  onRevert: (versionId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Version history component
 */
export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, onRevert, onClose }) => {
  const [reverting, setReverting] = useState<string | null>(null);

  const handleRevert = async (versionId: string) => {
    setReverting(versionId);
    try {
      await onRevert(versionId);
    } finally {
      setReverting(null);
    }
  };

  return (
    <div className="version-history-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Version History</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="versions-timeline">
          {versions.map((version, index) => (
            <div key={version.id} className="version-item">
              <div className="version-marker">
                <span className="version-number">v{version.version}</span>
              </div>
              <div className="version-content">
                <p className="version-text">{version.prompt_text}</p>
                <p className="version-meta">
                  By {version.created_by} on {new Date(version.created_at).toLocaleString()}
                </p>
              </div>
              {index > 0 && (
                <button
                  onClick={() => handleRevert(version.id)}
                  disabled={reverting === version.id}
                  className="btn-revert"
                >
                  {reverting === version.id ? 'Reverting...' : 'Revert'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PreviewModalProps {
  previewId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  onClose: () => void;
}

/**
 * Preview modal component
 */
export const PreviewModal: React.FC<PreviewModalProps> = ({ _previewId, status, videoUrl, error, onClose }) => {
  return (
    <div className="preview-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Preview Video</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="preview-content">
          {status === 'pending' && <p className="status-pending">Generating preview...</p>}
          {status === 'processing' && <p className="status-processing">Processing video...</p>}
          {status === 'completed' && videoUrl && (
            <video controls className="preview-video">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          {status === 'failed' && <p className="status-error">Error: {error || 'Preview generation failed'}</p>}
        </div>
      </div>
    </div>
  );
};

interface EmotionalPromptsManagerProps {
  characters: Character[];
}

/**
 * Main emotional prompts manager component
 */
export const EmotionalPromptsManager: React.FC<EmotionalPromptsManagerProps> = ({ characters }) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>();
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const selectedPrompt = selectedCharacterId && selectedEmotion
    ? prompts.find(p => p.character_id === selectedCharacterId && p.emotion === selectedEmotion)
    : null;

  const handleSelectCharacter = async (characterId: string) => {
    setSelectedCharacterId(characterId);
    setSelectedEmotion(undefined);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/characters/${characterId}/emotional-prompts`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async (promptText: string) => {
    if (!selectedCharacterId || !selectedEmotion) return;

    try {
      const response = await fetch(
        `/api/admin/characters/${selectedCharacterId}/emotional-prompts/${selectedEmotion}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_text: promptText }),
        }
      );
      const updated = await response.json();
      setPrompts(prompts.map(p => (p.emotion === selectedEmotion ? updated : p)));
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const handleTestPrompt = async (promptText: string) => {
    if (!selectedCharacterId || !selectedEmotion) return;

    try {
      const response = await fetch(
        `/api/admin/characters/${selectedCharacterId}/emotional-prompts/${selectedEmotion}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_text: promptText }),
        }
      );
      const preview = await response.json();
      setPreviewStatus(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  const handleShowVersions = async () => {
    if (!selectedCharacterId || !selectedEmotion) return;

    try {
      const response = await fetch(
        `/api/admin/characters/${selectedCharacterId}/emotional-prompts/${selectedEmotion}/versions`
      );
      const data = await response.json();
      setVersions(data.versions || []);
      setShowVersions(true);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    if (!selectedCharacterId || !selectedEmotion) return;

    try {
      const response = await fetch(
        `/api/admin/characters/${selectedCharacterId}/emotional-prompts/${selectedEmotion}/revert`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version_id: versionId }),
        }
      );
      const updated = await response.json();
      setPrompts(prompts.map(p => (p.emotion === selectedEmotion ? updated : p)));
      setShowVersions(false);
    } catch (error) {
      console.error('Failed to revert version:', error);
    }
  };

  return (
    <div className="emotional-prompts-manager">
      <div className="manager-layout">
        <div className="sidebar">
          <CharacterList
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={handleSelectCharacter}
          />
        </div>

        <div className="main-content">
          {selectedCharacterId && (
            <>
              <EmotionalStatesList
                characterId={selectedCharacterId}
                prompts={prompts}
                selectedEmotion={selectedEmotion}
                onSelectEmotion={setSelectedEmotion}
              />

              {selectedEmotion && (
                <PromptEditor
                  characterId={selectedCharacterId}
                  emotion={selectedEmotion}
                  prompt={selectedPrompt || null}
                  onSave={handleSavePrompt}
                  onTest={handleTestPrompt}
                  onShowVersions={handleShowVersions}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>

      {showVersions && (
        <VersionHistory
          versions={versions}
          onRevert={handleRevertVersion}
          onClose={() => setShowVersions(false)}
        />
      )}

      {showPreview && previewStatus && (
        <PreviewModal
          previewId={previewStatus.preview_id}
          status={previewStatus.status}
          videoUrl={previewStatus.video_url}
          error={previewStatus.error}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
