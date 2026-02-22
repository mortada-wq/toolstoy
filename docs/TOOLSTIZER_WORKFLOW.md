# The Toolstizer - Product to Persona Transformation System

## Concept

**The Toolstizer** is the "kitchen" where products are transformed into living animated personas.

```
Product Image → [TOOLSTIZER] → Living Character
     📦              🔥              🎭
```

## User Workflow

### Step 1: Upload Product
User provides:
- Product image (photo of their actual product)
- Product name
- Brand name
- Optional: Product description

### Step 2: Toolstizer Processing
System automatically:
1. Analyzes product image (colors, shape, style)
2. Extracts product features
3. Applies Admin's Master Prompt Template
4. Combines: `{MASTER_TEMPLATE} + {PRODUCT_ANALYSIS} + {USER_INFO}`
5. Generates 3 character variations
6. User picks favorite
7. Generates animation states

### Step 3: Living Character Output
User receives:
- Character image (based on their product)
- Multiple animation states (idle, talking, etc.)
- Ready-to-use widget code
- Character is "alive" and ready to chat

## Admin Master Prompt Template

### Template Structure

```
{STYLE_INSTRUCTIONS}
{PRODUCT_PLACEHOLDER}
{QUALITY_SETTINGS}
{TECHNICAL_SPECS}
```

### Example Master Template

```
Professional 3D character mascot design representing {PRODUCT_NAME}.

Style: Modern, friendly, approachable
Art Direction: Clean illustration style, vibrant colors inspired by {PRODUCT_COLORS}
Character Design: Anthropomorphic representation of {PRODUCT_TYPE}, incorporating key visual elements from the product
Personality: {CHARACTER_TYPE} - {VIBE_TAGS}
Composition: Full body character, centered, facing forward
Background: Simple gradient or solid color, professional
Quality: High detail, professional illustration, suitable for e-commerce
Technical: 1024x1024, PNG with transparency, optimized for web

Avoid: Realistic humans, dark themes, complex backgrounds, text overlays
```

### Template Variables (Auto-Replaced)

- `{PRODUCT_NAME}` - From user input
- `{PRODUCT_TYPE}` - Detected from image (headphones, bottle, bag, etc.)
- `{PRODUCT_COLORS}` - Extracted from product image
- `{CHARACTER_TYPE}` - User selection (robot, sage, athlete, etc.)
- `{VIBE_TAGS}` - User selection (friendly, energetic, wise, etc.)
- `{BRAND_STYLE}` - Optional: Brand guidelines

## Product Image Analysis

### What We Extract

1. **Dominant Colors**
   - Primary color (for character design)
   - Secondary colors (for accents)
   - Color palette (for background)

2. **Product Category**
   - Electronics (tech-style character)
   - Beauty/Skincare (elegant character)
   - Sports/Fitness (energetic character)
   - Food/Beverage (friendly character)
   - Fashion (stylish character)

3. **Visual Style**
   - Modern/Minimalist
   - Vintage/Classic
   - Playful/Fun
   - Luxury/Premium
   - Natural/Organic

4. **Key Features**
   - Shape characteristics
   - Texture hints
   - Brand elements (if visible)

## Database Schema

### Master Prompt Templates Table

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES merchants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Only one active template at a time
CREATE UNIQUE INDEX idx_active_template ON prompt_templates(is_active) WHERE is_active = true;
```

### Product Images Table

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  persona_id UUID REFERENCES personas(id),
  original_url VARCHAR(500) NOT NULL,
  analyzed_colors JSONB,
  detected_category VARCHAR(100),
  visual_style VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## Admin UI - Template Manager

### Template Editor

```tsx
<div className="template-editor">
  <h2>Master Prompt Template</h2>
  
  <textarea
    value={template}
    onChange={handleTemplateChange}
    rows={20}
    placeholder="Enter master prompt template..."
  />
  
  <div className="available-variables">
    <h3>Available Variables</h3>
    <ul>
      <li><code>{PRODUCT_NAME}</code> - Product name from user</li>
      <li><code>{PRODUCT_TYPE}</code> - Auto-detected category</li>
      <li><code>{PRODUCT_COLORS}</code> - Extracted color palette</li>
      <li><code>{CHARACTER_TYPE}</code> - User's character choice</li>
      <li><code>{VIBE_TAGS}</code> - User's vibe selections</li>
    </ul>
  </div>
  
  <button onClick={saveTemplate}>Save Template</button>
  <button onClick={testTemplate}>Test with Sample Product</button>
</div>
```

### Template Preview

```tsx
<div className="template-preview">
  <h3>Preview with Sample Data</h3>
  
  <div className="sample-inputs">
    <input placeholder="Product Name" value="Wireless Headphones" />
    <input placeholder="Character Type" value="Friendly Robot" />
    <input placeholder="Vibe Tags" value="Modern, Tech-savvy" />
  </div>
  
  <div className="generated-prompt">
    <h4>Generated Prompt:</h4>
    <pre>{previewPrompt}</pre>
  </div>
  
  <button onClick={generatePreview}>Generate Test Image</button>
</div>
```

## Character Studio - User Experience

### Step 1: Product Upload

```tsx
<div className="product-upload">
  <h2>Add Your Product to the Toolstizer</h2>
  <p>Upload a photo of your product - we'll transform it into a living character!</p>
  
  <div className="upload-zone">
    <input type="file" accept="image/*" />
    <p>Drop product image here or click to upload</p>
  </div>
  
  <div className="product-info">
    <input placeholder="Product Name" />
    <input placeholder="Brand Name" />
    <textarea placeholder="Product Description (optional)" />
  </div>
</div>
```

### Step 2: Character Customization

```tsx
<div className="character-options">
  <h3>Choose Your Character Style</h3>
  
  <select name="characterType">
    <option>Friendly Robot</option>
    <option>Wise Sage</option>
    <option>Energetic Athlete</option>
    <option>Elegant Guide</option>
  </select>
  
  <div className="vibe-tags">
    <label><input type="checkbox" /> Modern</label>
    <label><input type="checkbox" /> Friendly</label>
    <label><input type="checkbox" /> Professional</label>
    <label><input type="checkbox" /> Playful</label>
  </div>
</div>
```

### Step 3: Toolstizer Processing

```tsx
<div className="toolstizer-processing">
  <div className="cooking-animation">
    🔥 Toolstizer is cooking your character...
  </div>
  
  <div className="progress-steps">
    <div className="step completed">✓ Analyzing product image</div>
    <div className="step active">⏳ Generating character variations</div>
    <div className="step">⏳ Creating animations</div>
  </div>
  
  <div className="estimated-time">
    Estimated time: 2-3 minutes
  </div>
</div>
```

### Step 4: Review & Approve

```tsx
<div className="character-variations">
  <h3>Pick Your Favorite Character</h3>
  
  <div className="variations-grid">
    {variations.map(v => (
      <div className="variation" onClick={() => approve(v.id)}>
        <img src={v.url} />
        <button>Choose This One</button>
      </div>
    ))}
  </div>
</div>
```

## API Endpoints

### Admin - Template Management

```typescript
// Get active template
GET /api/admin/prompt-template

// Update template
PUT /api/admin/prompt-template
{
  template: "...",
  name: "Default Template v2"
}

// Test template
POST /api/admin/prompt-template/test
{
  template: "...",
  sampleData: {
    productName: "Wireless Headphones",
    characterType: "Robot",
    vibeTags: ["Modern", "Tech"]
  }
}
```

### User - Character Generation

```typescript
// Upload product & start generation
POST /api/personas/generate
{
  productImage: File,
  productName: "Wireless Headphones",
  brandName: "AudioTech",
  characterType: "robot",
  vibeTags: ["modern", "friendly"],
  description: "Premium wireless headphones"
}

Response:
{
  jobId: "...",
  status: "processing",
  estimatedTime: 180 // seconds
}

// Check generation status
GET /api/personas/generate/:jobId

Response:
{
  status: "completed",
  variations: [
    { id: "...", url: "...", seed: 12345 },
    { id: "...", url: "...", seed: 67890 },
    { id: "...", url: "...", seed: 24680 }
  ]
}

// Approve variation
POST /api/personas/generate/:jobId/approve
{
  variationId: "..."
}

// Generate animations
POST /api/personas/generate/:jobId/animate
{
  states: ["idle", "talking", "thinking", "greeting"]
}
```

## Prompt Generation Logic

```typescript
function generateFinalPrompt(
  masterTemplate: string,
  productAnalysis: ProductAnalysis,
  userInput: UserInput
): string {
  let prompt = masterTemplate
  
  // Replace variables
  prompt = prompt.replace('{PRODUCT_NAME}', userInput.productName)
  prompt = prompt.replace('{PRODUCT_TYPE}', productAnalysis.category)
  prompt = prompt.replace('{PRODUCT_COLORS}', productAnalysis.colors.join(', '))
  prompt = prompt.replace('{CHARACTER_TYPE}', userInput.characterType)
  prompt = prompt.replace('{VIBE_TAGS}', userInput.vibeTags.join(', '))
  
  return prompt
}
```

## Benefits

### For Users
- Simple: Just upload product photo
- No prompt engineering needed
- Consistent quality (admin controls template)
- Fast: Automated process
- Professional results every time

### For Admins
- Full control over output quality
- One template affects all generations
- Easy to update style/quality
- Can A/B test different templates
- Maintain brand consistency

### For Business
- Scalable: Same template for all users
- Quality control: Admin approval
- Differentiation: Unique "Toolstizer" process
- Upsell: Premium templates for higher tiers

## Future Enhancements

- Multiple template options (user can choose style)
- Template marketplace (community templates)
- Brand-specific templates (enterprise feature)
- Template versioning (rollback if needed)
- A/B testing templates automatically
- Template analytics (which generates best characters)

---

**Status:** Design Complete, Implementation Pending
**Last Updated:** 2026-02-21
