# Bedrock Playground - Image Approval Workflow

## Overview

Enhanced the Bedrock Playground with a 3-variation approval system for better quality control before making characters live.

## New Workflow

### Image Generation Mode

**Step 1: Generate 3 Variations**
- Click "Generate 3 Variations" button
- System generates 3 different versions of the character
- Each uses a different random seed
- Cost: 3x the single image cost

**Step 2: Review & Approve**
- See all 3 variations side-by-side in a grid
- Each shows:
  - Variation number (#1, #2, #3)
  - Generation seed (for reproducibility)
  - Timestamp
  - Click-to-approve overlay
- Click on your preferred variation to approve it
- Approved variation gets green border + checkmark badge

**Step 3: Actions**
Once approved, you can:
- **Make Live** - Publish to production
- **Assign to User** - Give this character to a specific user
- **Regenerate with Edits** - Modify prompt and generate 3 new variations

### Video Generation Mode (Multi-State)

**Step 1: Generate 3 Image Variations**
- Same as image mode
- Must approve one before continuing

**Step 2: Generate States**
- Uses the approved image as base
- Generates all selected animation states
- Each state uses the same approved character

## Admin-Only Features

### Make Live
- Uploads approved image to S3
- Updates character in database
- Makes character visible to users
- Shows confirmation with generation details

### Assign to User
- Modal opens with email input
- Enter user email address
- Character is assigned to that user
- User receives email notification
- Admin can assign characters they create to any user

### Detailed Generation Info
Admin sees:
- Exact generation timestamp
- Model used (Titan vs Stable Diffusion)
- Seed number (for reproducibility)
- Cost breakdown
- Full generation logs

### Manual Character Management
Admins can:
- Create characters for users
- Edit any user's characters
- Reassign characters between users
- View all characters across platform
- Override generation settings

## UI Components

### Variation Grid
```tsx
<div className="grid grid-cols-3 gap-3">
  {variations.map((variation, index) => (
    <div className="relative border-2 rounded-lg">
      <img src={variation.url} />
      <div className="absolute top-2 left-2">#{index + 1}</div>
      {variation.approved && <div className="badge">✓ Approved</div>}
      <div className="absolute bottom-0">
        Seed: {variation.seed}
        {variation.generatedAt}
      </div>
    </div>
  ))}
</div>
```

### Action Buttons
```tsx
{selectedVariation && (
  <>
    <button onClick={handleMakeLive}>✓ Make Live</button>
    <button onClick={() => setShowAssignModal(true)}>Assign to User</button>
  </>
)}
<button onClick={handleRegenerateWithEdits}>Regenerate with Edits</button>
```

### Assign Modal
```tsx
<Modal show={showAssignModal}>
  <h3>Assign Character to User</h3>
  <input 
    type="email" 
    placeholder="user@example.com"
    value={assignToEmail}
    onChange={(e) => setAssignToEmail(e.target.value)}
  />
  <button onClick={handleAssignToUser}>Assign</button>
</Modal>
```

## Data Structure

### ImageVariation Interface
```typescript
interface ImageVariation {
  id: string
  url: string
  seed: number
  approved: boolean
  generatedAt: string
}
```

### State Management
```typescript
const [imageVariations, setImageVariations] = useState<ImageVariation[]>([])
const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
const [showAssignModal, setShowAssignModal] = useState(false)
const [assignToEmail, setAssignToEmail] = useState('')
```

## API Calls (To Implement)

### Generate 3 Variations
```typescript
POST /api/admin/bedrock/generate
{
  type: 'image',
  model: 'titan',
  prompt: '...',
  variations: 3,
  seeds: [12345, 67890, 24680] // Optional: specify seeds
}

Response:
{
  variations: [
    { id: '...', url: '...', seed: 12345, generatedAt: '...' },
    { id: '...', url: '...', seed: 67890, generatedAt: '...' },
    { id: '...', url: '...', seed: 24680, generatedAt: '...' }
  ]
}
```

### Make Live
```typescript
POST /api/admin/characters/make-live
{
  variationId: '...',
  characterId: '...',
  imageUrl: '...'
}
```

### Assign to User
```typescript
POST /api/admin/characters/assign
{
  characterId: '...',
  userEmail: 'user@example.com',
  imageUrl: '...',
  notifyUser: true
}
```

## User Experience

### For Admins
1. Generate 3 options to choose from
2. Pick the best one visually
3. Make it live or assign to user
4. See full generation details
5. Can regenerate if none are good

### For Regular Users (Future)
1. Generate 3 options in Character Studio
2. Pick favorite
3. Automatically made live
4. No manual assignment needed
5. Limited regeneration attempts per plan

## Benefits

1. **Quality Control** - Review before publishing
2. **Choice** - Pick best from 3 options
3. **Reproducibility** - Seed tracking for regeneration
4. **Flexibility** - Regenerate with prompt edits
5. **Admin Power** - Assign characters to any user
6. **Audit Trail** - Full generation history

## Cost Implications

- 3 variations = 3x cost per generation
- Titan: $0.008 × 3 = $0.024 per character
- Stable Diffusion: $0.04 × 3 = $0.12 per character
- Regeneration adds another 3x cost
- Consider limiting regenerations per user/plan

## Next Steps

1. Implement actual Bedrock API calls
2. Add S3 upload for approved images
3. Create assign-to-user endpoint
4. Add generation history tracking
5. Implement seed-based regeneration
6. Add comparison view (side-by-side)
7. Allow saving rejected variations
8. Add batch generation for multiple characters

---

**Status:** UI Complete, Backend Integration Pending
**Last Updated:** 2026-02-21
