# AWS Bedrock Image Generation - Implementation Q&A

## Architecture Overview

Toolstoy uses AWS Amplify Gen2 with the following stack:
- Frontend: React + TypeScript + Vite
- Backend: AWS Lambda functions + API Gateway (HTTP API)
- Auth: Cognito User Pools
- Database: PostgreSQL (RDS) + DynamoDB (Amplify Data)
- AI: Amazon Bedrock (planned for character generation and image creation)

---

## 1. Image Generation Workflow

**Q: How will Bedrock image generation integrate into the character creation flow?**

**A:** The Soul Engine Lambda (`amplify/functions/soul-engine/`) will orchestrate the multi-step character generation process:

1. User submits character via `/api/personas/:id/submit` (triggers SQS message)
2. Soul Engine Lambda processes the queue message
3. Steps executed sequentially:
   - Extract product data (scraper API)
   - Generate personality traits (Bedrock Claude)
   - Generate character bible/knowledge base (Bedrock Claude)
   - **Generate character image (Bedrock Stable Diffusion or Titan Image)**
   - Store image in S3
   - Update persona record with image URL
   - Mark generation job as complete

The `generation_jobs` table tracks progress with `current_step` field for real-time status updates.

---

## 2. Model Selection

**Q: Which Bedrock model should we use for image generation?**

**A:** Recommended options:

**Primary: Amazon Titan Image Generator G1**
- Native AWS model, better integration
- Supports 1024x1024, 512x512 resolutions
- Text-to-image and image variation
- Lower cost than Stable Diffusion
- Model ID: `amazon.titan-image-generator-v1`

**Alternative: Stable Diffusion XL**
- Higher quality, more artistic control
- 1024x1024 resolution
- Model ID: `stability.stable-diffusion-xl-v1`

**Recommendation:** Start with Titan for cost efficiency, add Stable Diffusion as premium option later.

---

## 3. Storage Strategy

**Q: Where should generated images be stored?**

**A:** Use S3 with CloudFront CDN:

**Bucket Structure:**
```
toolstoy-character-images/
├── personas/
│   ├── {persona-id}/
│   │   ├── avatar.png (main character image)
│   │   ├── thumbnail.png (widget preview)
│   │   └── variations/ (future: multiple poses)
```

**Implementation:**
- Create S3 bucket in `amplify/backend.ts` using CDK
- Enable public read access for character images
- Add CloudFront distribution for global CDN
- Store URL in `personas.image_url` (PostgreSQL) and `Persona.imageUrl` (DynamoDB)

**IAM Permissions needed:**
- Soul Engine Lambda: `s3:PutObject`, `s3:GetObject`
- CloudFront: `s3:GetObject` on bucket

---

## 4. Prompt Engineering

**Q: How do we generate effective prompts for character images?**

**A:** Build prompts dynamically from character data:

```typescript
function buildImagePrompt(persona: Persona): string {
  const { productName, characterType, vibeTags, personality } = persona
  
  return `Professional product mascot character design for ${productName}.
Style: ${characterType} (e.g., "friendly robot", "wise sage", "energetic athlete")
Personality: ${vibeTags.join(', ')}
Art style: Clean, modern, friendly, suitable for e-commerce
Background: Simple gradient or solid color
Composition: Character centered, facing forward, full body or portrait
Quality: High detail, professional illustration, vibrant colors
Avoid: Text, logos, realistic humans, dark themes`
}
```

**Best Practices:**
- Include product context without showing actual product
- Specify art style clearly (illustration vs photo-realistic)
- Use personality traits to guide visual design
- Add negative prompts to avoid unwanted elements
- Keep prompts under 512 tokens

---

## 5. Cost Management

**Q: What are the cost implications?**

**A:** Bedrock pricing (us-east-1):

**Titan Image Generator:**
- 1024x1024: $0.008 per image
- 512x512: $0.004 per image

**Stable Diffusion XL:**
- 1024x1024: $0.04 per image (5x more expensive)

**Estimated costs:**
- Free plan: 3 characters = $0.024 (Titan) or $0.12 (SD)
- Pro plan: 10 characters = $0.08 (Titan) or $0.40 (SD)
- Enterprise: 50 characters = $0.40 (Titan) or $2.00 (SD)

**Cost controls:**
- Implement rate limiting per merchant
- Cache generated images (don't regenerate on edits)
- Add "regenerate image" as separate action with cooldown
- Track usage in `generation_jobs` table

---

## 6. Error Handling

**Q: How should we handle generation failures?**

**A:** Multi-layer approach:

**Lambda Level:**
```typescript
try {
  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'amazon.titan-image-generator-v1',
    body: JSON.stringify(imageRequest)
  }))
  // Process response
} catch (error) {
  if (error.name === 'ThrottlingException') {
    // Retry with exponential backoff
  } else if (error.name === 'ValidationException') {
    // Log prompt issue, use fallback image
  } else {
    // Log error, mark job as failed
  }
}
```

**Database Tracking:**
- Update `generation_jobs.status` to 'failed'
- Store `error_message` for debugging
- Frontend polls status and shows user-friendly error

**Fallback Strategy:**
- Use default placeholder images by character type
- Allow manual image upload as alternative
- Retry failed jobs automatically (max 3 attempts)

---

## 7. IAM Permissions

**Q: What IAM permissions does Soul Engine Lambda need?**

**A:** Add to `amplify/functions/soul-engine/resource.ts`:

```typescript
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'

// In resource definition:
soulEngine.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream'
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/amazon.titan-image-generator-v1',
      'arn:aws:bedrock:*::foundation-model/stability.stable-diffusion-xl-v1'
    ]
  })
)

soulEngine.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:PutObject', 's3:GetObject'],
    resources: ['arn:aws:s3:::toolstoy-character-images/*']
  })
)
```

---

## 8. Response Format

**Q: What does the Bedrock response look like?**

**A:** Titan Image Generator returns base64-encoded PNG:

```typescript
const response = await bedrockClient.send(new InvokeModelCommand({
  modelId: 'amazon.titan-image-generator-v1',
  contentType: 'application/json',
  accept: 'application/json',
  body: JSON.stringify({
    taskType: 'TEXT_IMAGE',
    textToImageParams: {
      text: prompt,
      negativeText: 'text, watermark, logo, blurry'
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      quality: 'premium',
      height: 1024,
      width: 1024,
      cfgScale: 8.0,
      seed: Math.floor(Math.random() * 1000000)
    }
  })
}))

const result = JSON.parse(new TextDecoder().decode(response.body))
const base64Image = result.images[0] // Base64 string
const imageBuffer = Buffer.from(base64Image, 'base64')

// Upload to S3
await s3Client.send(new PutObjectCommand({
  Bucket: 'toolstoy-character-images',
  Key: `personas/${personaId}/avatar.png`,
  Body: imageBuffer,
  ContentType: 'image/png'
}))
```

---

## 9. Testing Strategy

**Q: How do we test Bedrock integration?**

**A:** Phased approach:

**Phase 1: Local Testing**
- Use AWS CLI to test Bedrock API directly
- Validate prompt engineering with sample characters
- Test different models and parameters

**Phase 2: Lambda Testing**
- Deploy Soul Engine with Bedrock permissions
- Test via SQS message injection
- Monitor CloudWatch logs for errors

**Phase 3: Integration Testing**
- Test full flow: Character Studio → Submit → Generation → Display
- Verify S3 upload and CloudFront delivery
- Test error scenarios (throttling, invalid prompts)

**Phase 4: Load Testing**
- Simulate multiple concurrent generations
- Verify rate limiting works
- Monitor costs in AWS Cost Explorer

---

## 10. Timeline & Dependencies

**Q: What's needed before implementation?**

**A:** Prerequisites:

1. **Bedrock Access** (1-2 days)
   - Request model access in AWS Console
   - Enable Titan Image Generator and/or Stable Diffusion
   - Verify region availability (us-east-1 recommended)

2. **S3 + CloudFront Setup** (1 day)
   - Create S3 bucket with CDK
   - Configure CloudFront distribution
   - Set up CORS for image access

3. **Soul Engine Implementation** (3-5 days)
   - Implement SQS polling
   - Add Bedrock SDK integration
   - Build prompt generation logic
   - Add S3 upload functionality
   - Implement error handling and retries

4. **Testing & Refinement** (2-3 days)
   - Test various character types
   - Refine prompts for quality
   - Optimize costs and performance

**Total Estimate:** 7-11 days

---

## 11. Phase 5 Integration

**Q: How does this fit into Phase 5 scope?**

**A:** Currently Phase 5 focuses on billing, polish, and launch readiness. Bedrock image generation is a Phase 6 feature, but we can prepare:

**Phase 5 (Current):**
- UI already supports image display (`personas.image_url`)
- Manual image upload as temporary solution
- Placeholder images for testing

**Phase 6 (Bedrock Integration):**
- Implement Soul Engine with Bedrock
- Add "Generate Image" button in Character Studio
- Show generation progress in real-time
- Add "Regenerate" option for existing characters

---

## 12. Alternative: Manual Upload

**Q: Should we support manual image upload?**

**A:** Yes, as both fallback and premium feature:

**Use Cases:**
- Bedrock generation fails
- User wants custom artwork
- Brand-specific character designs
- Enterprise customers with existing assets

**Implementation:**
- Add file upload in Character Studio (Details tab)
- Validate: PNG/JPG, max 5MB, min 512x512
- Upload directly to S3 from frontend (presigned URLs)
- Override Bedrock-generated image

---

## Next Steps

1. Request Bedrock model access in AWS Console
2. Create S3 bucket and CloudFront distribution in `amplify/backend.ts`
3. Implement Soul Engine Lambda with Bedrock integration
4. Add IAM permissions for Bedrock and S3
5. Test with sample characters
6. Deploy and monitor costs

---

## References

- [Bedrock Titan Image Generator](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-titan-image.html)
- [Bedrock Stable Diffusion](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-diffusion.html)
- [Amplify Gen2 CDK](https://docs.amplify.aws/gen2/build-a-backend/add-aws-services/)
- Current Schema: `database/schema.sql`
- Current Backend: `amplify/backend.ts`


---

## 13. Video Generation (Character State Animations)

**Q: Can we generate short looping videos for character animations?**

**A:** Yes! But Toolstoy requires MULTIPLE state-based animation videos per character, not just one.

### Character Animation States System

**Concept:** Each character needs 4-12 different animation videos triggered by conversation context:

**Basic States (Free Plan - 4 videos):**
1. **Idle** - Default breathing/waiting animation (loops continuously)
2. **Talking** - Active speaking animation (plays during AI response)
3. **Thinking** - Processing/loading animation (plays while generating response)
4. **Greeting** - Welcome animation (plays on first interaction)

**Pro States (Pro Plan - 8 videos):**
5. **Happy** - Positive emotion (triggered by positive sentiment)
6. **Confused** - Uncertain response (triggered when confidence < 50%)
7. **Excited** - High energy (triggered by product features/benefits)
8. **Listening** - Attentive (plays while user is typing)

**Enterprise States (Enterprise Plan - 12 videos):**
9. **Sad** - Empathetic response (triggered by complaints/issues)
10. **Surprised** - Unexpected question (triggered by off-topic queries)
11. **Confident** - Expert mode (triggered by technical questions)
12. **Farewell** - Goodbye animation (plays on conversation end)

### Available Video Models

**1. Amazon Nova Canvas (Image-to-Video)**
- Model ID: `amazon.nova-canvas-v1:0`
- Type: Image-to-Video (required for consistency)
- Duration: 6 seconds (configurable)
- Resolution: 1280x720 or 720x1280
- Cost: ~$0.05 per video
- Best for: All character states

**2. Amazon Nova Reel (Image-to-Video)**
- Model ID: `amazon.nova-reel-v1:0`
- Type: Image-to-Video (cinematic quality)
- Duration: 6 seconds
- Resolution: 1280x720
- Cost: ~$0.08 per video
- Best for: Premium/enterprise tier

**3. Stable Video Diffusion (Legacy)**
- Model ID: `stability.stable-video-diffusion-img2vid-v1`
- Type: Image-to-Video only
- Duration: 4 seconds (fixed)
- Resolution: 1024x576
- Cost: ~$0.10 per video
- Best for: Fallback option

### Comparison Table

| Feature | Nova Canvas | Nova Reel | Stable Diffusion |
|---------|-------------|-----------|------------------|
| Image-to-Video | ✅ Yes | ✅ Yes | ✅ Yes |
| Duration | 4-6 sec | 6 sec | 4 sec (fixed) |
| Resolution | 1280x720 | 1280x720 | 1024x576 |
| Cost per video | $0.05 | $0.08 | $0.10 |
| Quality | Good | Cinematic | Good |
| Control | High | High | Limited |

### Recommended Model: Amazon Nova Canvas

**Why Nova Canvas for multi-state animations:**

1. **Cheapest** - $0.05 per video × 12 states = $0.60 per character (vs $1.20 with Stable Diffusion)
2. **Flexible Duration** - Can adjust 4-6 seconds per state
3. **Better Resolution** - 1280x720 vs 1024x576
4. **Consistent Quality** - All states look cohesive
5. **Motion Control** - Adjust intensity per state (idle=subtle, excited=high energy)

---

### Looping Strategy

**Q: How do we create seamless loops?**

**A:** Two approaches:

**Option 1: Post-Processing (Recommended)**
```typescript
// 1. Generate video from Bedrock
// 2. Extract frames using FFmpeg
// 3. Blend first and last frames
// 4. Recreate video with smooth transition

const ffmpeg = require('fluent-ffmpeg')

// Extract frames
ffmpeg('character.mp4')
  .output('frames/frame-%03d.png')
  .run()

// Blend first and last frame (using ImageMagick or Canvas)
// Then recreate video with crossfade
```

**Option 2: Prompt Engineering**
- Use prompts like "subtle breathing motion", "gentle idle animation"
- Avoid large movements that won't loop well
- Request "minimal motion" for easier looping
- Generate multiple variations, pick best loop

**Reality:** Perfect loops require post-processing. Bedrock doesn't guarantee matching start/end frames.

---

### Background Removal

**Q: Can we remove backgrounds to get transparent videos?**

**A:** Not directly from Bedrock, but achievable:

**Bedrock Output:**
- Always includes background
- No alpha channel support
- MP4 format (no transparency)

**Post-Processing Solutions:**

**Option 1: AWS Rekognition + FFmpeg**
```typescript
// 1. Extract frames from video
// 2. Use Rekognition to detect person/object
// 3. Apply background removal per frame
// 4. Composite onto transparent background
// 5. Export as WebM with alpha channel
```

**Option 2: Third-Party APIs**
- Remove.bg API (has video support)
- Runway ML (background removal)
- Cost: ~$0.20-0.50 per video

**Option 3: Generate with Simple Background**
- Prompt: "character on solid white background"
- Use chroma key (green screen effect) in post-processing
- Easier to remove programmatically

**Recommendation:** Generate with solid color background, then remove via chroma key.

---

### Format Conversion

**Q: Can we convert to GIF or WebM?**

**A:** Yes, using FFmpeg in Lambda or separate processing:

**MP4 → WebM (with transparency):**
```bash
ffmpeg -i character.mp4 \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -auto-alt-ref 0 \
  character.webm
```

**MP4 → GIF (optimized):**
```bash
ffmpeg -i character.mp4 \
  -vf "fps=10,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 \
  character.gif
```

**File Sizes (4 sec, 512x512):**
- MP4: ~200-500 KB
- WebM: ~150-400 KB
- GIF: ~800 KB - 2 MB (larger!)

**Recommendation:** Use WebM for web (better compression, transparency support). Fallback to MP4 for older browsers.

---

### Video Length Options

**Q: Can we generate longer or shorter videos?**

**A:** Duration options by model:

**Amazon Nova Canvas:**
- Duration: 6 seconds (default)
- Configurable: Yes (check latest docs for range)
- Best for: Standard character animations

**Amazon Nova Reel:**
- Duration: 6 seconds (default)
- Configurable: Yes (check latest docs for range)
- Best for: Cinematic quality

**Stable Video Diffusion:**
- Duration: 4 seconds (fixed)
- Configurable: No
- Limited flexibility

**Workarounds for longer videos:**
- Loop the video multiple times (CSS or video player)
- Generate multiple variations and stitch together
- Slow down playback (CSS: `animation-duration: 12s`)
- Use video editing in post-processing

**Recommendation:** Nova Canvas/Reel offer more flexibility. Start with 6 seconds, adjust based on user feedback.

---

### Testing Playground

**Q: Where can we test before implementing?**

**A:** Multiple options:

**1. AWS Bedrock Playground (Console) - RECOMMENDED**
- Go to AWS Console → Bedrock → Playgrounds → Image & Video
- Select model: "Nova Canvas" or "Nova Reel" or "Stable Video Diffusion"
- For Nova: Enter text prompt directly
- For Stable Diffusion: Upload test image
- Adjust parameters (motion intensity, duration, style)
- Download result and test in browser
- **Cost:** Same as API calls ($0.05-0.10 per video)

**2. AWS CLI Testing - Nova Canvas (Text-to-Video)**
```bash
# Create request JSON
cat > request.json << EOF
{
  "taskType": "TEXT_VIDEO",
  "textToVideoParams": {
    "text": "A friendly robot mascot character with blue metallic body, gentle idle breathing animation, standing on solid white background, subtle head tilt, professional 3D illustration style"
  },
  "videoGenerationConfig": {
    "durationSeconds": 6,
    "fps": 24,
    "dimension": "1280x720",
    "seed": 42
  }
}
EOF

# Call Bedrock
aws bedrock-runtime invoke-model \
  --model-id amazon.nova-canvas-v1:0 \
  --body file://request.json \
  --region us-east-1 \
  output.json

# Extract video from response
jq -r '.video' output.json | base64 -d > character.mp4
```

**3. AWS CLI Testing - Nova Canvas (Image-to-Video)**
```bash
# Convert image to base64
base64 -i character.png -o character.b64

# Create request JSON
cat > request.json << EOF
{
  "taskType": "IMAGE_VIDEO",
  "imageToVideoParams": {
    "image": "$(cat character.b64)",
    "text": "Gentle breathing animation, subtle movement"
  },
  "videoGenerationConfig": {
    "durationSeconds": 6,
    "fps": 24
  }
}
EOF

# Call Bedrock
aws bedrock-runtime invoke-model \
  --model-id amazon.nova-canvas-v1:0 \
  --body file://request.json \
  --region us-east-1 \
  output.json

# Extract video
jq -r '.video' output.json | base64 -d > character.mp4
```

**4. Stability AI Platform (for Stable Diffusion only)**
- https://platform.stability.ai/
- Direct access to Stable Video Diffusion
- Test image-to-video conversions
- **Cost:** Credits required (~$0.10 per video)

**Recommendation:** Start with AWS Console Playground using Nova Canvas. Test both text-to-video and image-to-video approaches to see which produces better character animations.

---

### Implementation Architecture

**Q: How does video generation fit into Soul Engine?**

**A:** Multi-state video generation workflow:

**Soul Engine Lambda Flow (Multi-State Generation):**
```
1. Generate base character image (Titan Image Generator) → avatar.png
   - Store base64 in memory for all video generations
   - Upload PNG to S3 for static use
   
2. Generate multiple state videos from SAME base image:
   
   For each state (idle, talking, thinking, greeting, etc.):
   a. Call Nova Canvas Image-to-Video with state-specific prompt
   b. First frame = base image (guaranteed consistency)
   c. Motion prompt varies by state:
      - Idle: "gentle breathing, minimal movement, calm"
      - Talking: "mouth moving, expressive, animated speech"
      - Thinking: "looking up, pondering, hand on chin"
      - Greeting: "waving hand, friendly smile, welcoming gesture"
      - Happy: "jumping, excited movement, big smile"
      - Confused: "head tilt, scratching head, puzzled expression"
      - Excited: "energetic movement, arms raised, celebration"
      - Listening: "nodding, attentive, focused gaze"
   
3. Upload all videos to S3:
   - personas/{id}/avatar.png (static)
   - personas/{id}/states/idle.mp4
   - personas/{id}/states/talking.mp4
   - personas/{id}/states/thinking.mp4
   - personas/{id}/states/greeting.mp4
   - ... (up to 12 states)
   
4. (Optional) Post-process each video:
   - Convert to WebM for web optimization
   - Create looping versions with frame blending
   - Remove background if needed
   
5. Update persona record with state URLs (JSON object)
```

**Database Schema for Multi-State Videos:**
```sql
ALTER TABLE personas ADD COLUMN video_states JSONB DEFAULT '{}'::jsonb;

-- Example stored data:
{
  "idle": "https://cdn.toolstoy.app/personas/123/states/idle.mp4",
  "talking": "https://cdn.toolstoy.app/personas/123/states/talking.mp4",
  "thinking": "https://cdn.toolstoy.app/personas/123/states/thinking.mp4",
  "greeting": "https://cdn.toolstoy.app/personas/123/states/greeting.mp4",
  "happy": "https://cdn.toolstoy.app/personas/123/states/happy.mp4",
  "confused": "https://cdn.toolstoy.app/personas/123/states/confused.mp4",
  "excited": "https://cdn.toolstoy.app/personas/123/states/excited.mp4",
  "listening": "https://cdn.toolstoy.app/personas/123/states/listening.mp4"
}
```

**Frontend State Triggering Logic:**
```typescript
// In widget chat component
const [currentState, setCurrentState] = useState('idle')

// Trigger state changes based on conversation
useEffect(() => {
  if (isAIResponding) {
    setCurrentState('talking')
  } else if (isGenerating) {
    setCurrentState('thinking')
  } else if (isUserTyping) {
    setCurrentState('listening')
  } else if (sentiment === 'positive') {
    setCurrentState('happy')
  } else if (confidence < 0.5) {
    setCurrentState('confused')
  } else {
    setCurrentState('idle')
  }
}, [isAIResponding, isGenerating, isUserTyping, sentiment, confidence])

// Video element with state switching
<video
  src={persona.video_states[currentState]}
  autoPlay
  loop
  muted
/>
```

**Generation Job Tracking:**
```sql
ALTER TABLE generation_jobs ADD COLUMN states_generated TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE generation_jobs ADD COLUMN total_states INTEGER DEFAULT 4;

-- Track progress: "Generated 3 of 8 animation states"
```

---

### Cost Analysis

**Q: What are video generation costs for multi-state animations?**

**A:** Costs scale with number of states per character:

**Per-Video Pricing (us-east-1):**
- Amazon Nova Canvas: $0.05 per video
- Amazon Nova Reel: $0.08 per video
- Stable Video Diffusion: $0.10 per video

**Multi-State Cost Per Character (using Nova Canvas):**

| Plan | States | Videos | Cost per Character | 50 Characters |
|------|--------|--------|-------------------|---------------|
| Free | 4 | 4 | $0.20 | $10.00 |
| Pro | 8 | 8 | $0.40 | $20.00 |
| Enterprise | 12 | 12 | $0.60 | $30.00 |

**Total Cost Per Character (Image + All State Videos):**
- Free (4 states): $0.008 (image) + $0.20 (videos) = $0.208
- Pro (8 states): $0.008 (image) + $0.40 (videos) = $0.408
- Enterprise (12 states): $0.008 (image) + $0.60 (videos) = $0.608

**Comparison with Stable Diffusion:**
| Plan | Nova Canvas | Stable Diffusion | Savings |
|------|-------------|------------------|---------|
| Free (4 states) | $0.20 | $0.40 | 50% |
| Pro (8 states) | $0.40 | $0.80 | 50% |
| Enterprise (12 states) | $0.60 | $1.20 | 50% |

**Monthly Cost Estimates:**

**Free Plan (3 characters, 4 states each):**
- Generation: 3 × $0.208 = $0.62
- Storage (S3): ~$0.05/month
- CDN (CloudFront): ~$0.10/month
- **Total: ~$0.77/month**

**Pro Plan (10 characters, 8 states each):**
- Generation: 10 × $0.408 = $4.08
- Storage: ~$0.20/month
- CDN: ~$0.50/month
- **Total: ~$4.78/month**

**Enterprise Plan (50 characters, 12 states each):**
- Generation: 50 × $0.608 = $30.40
- Storage: ~$1.00/month
- CDN: ~$2.50/month
- **Total: ~$33.90/month**

**Cost Optimization Strategies:**
1. Generate states on-demand (only when character is published)
2. Cache generated videos (don't regenerate on edits)
3. Offer "regenerate state" as separate action with cooldown
4. Start with 4 basic states, unlock more with higher plans
5. Use Nova Canvas (50% cheaper than Stable Diffusion)

**Post-Processing Costs (if using Lambda):**
- FFmpeg processing: ~$0.001 per video
- Background removal: ~$0.20-0.50 per video (third-party API)
- Total for 12 states with BG removal: +$2.40-6.00 per character

---

### Video Use Cases

**Q: Where would we use character state videos?**

**A:** State-based animations throughout the user journey:

**Widget Chat Interface (Primary Use):**
1. **Idle** - Loops when no activity (default state)
2. **Listening** - Plays while user is typing
3. **Thinking** - Plays while AI generates response
4. **Talking** - Plays during AI response streaming
5. **Happy** - Triggered by positive sentiment detection
6. **Confused** - Triggered when AI confidence < 50%
7. **Excited** - Triggered when discussing product features
8. **Greeting** - Plays on first widget open

**Character Preview Pages:**
- **Idle** - Default loop on public character page
- **Greeting** - Plays on hover or page load
- **Excited** - Plays when user clicks "Chat Now"

**Dashboard/Studio:**
- **Idle** - Character preview in My Characters list
- **Greeting** - Character preview in widget settings

**Marketing/Showcase:**
- **Idle** - Homepage showcase cards
- **Excited** - Demo modal interactions

**State Triggering Logic Examples:**

```typescript
// Sentiment-based triggering
if (aiResponse.sentiment === 'positive') {
  playState('happy')
} else if (aiResponse.sentiment === 'negative') {
  playState('sad')
}

// Confidence-based triggering
if (aiResponse.confidence < 0.5) {
  playState('confused')
} else if (aiResponse.confidence > 0.9) {
  playState('confident')
}

// Context-based triggering
if (message.includes('price') || message.includes('buy')) {
  playState('excited')
} else if (message.includes('problem') || message.includes('issue')) {
  playState('sad')
}

// Conversation flow triggering
if (isFirstMessage) {
  playState('greeting')
} else if (isLastMessage) {
  playState('farewell')
}
```

**Recommendation:** Start with 4 basic states (idle, talking, thinking, greeting) for MVP. Add emotional states (happy, confused, excited) in Phase 2 based on user feedback.

---

### Technical Requirements

**Q: What's needed for video implementation?**

**A:** Additional dependencies:

**IAM Permissions (add all video models):**
```typescript
// amplify/functions/soul-engine/resource.ts
soulEngine.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      // Video models
      'arn:aws:bedrock:*::foundation-model/amazon.nova-canvas-v1:0',
      'arn:aws:bedrock:*::foundation-model/amazon.nova-reel-v1:0',
      'arn:aws:bedrock:*::foundation-model/stability.stable-video-diffusion-img2vid-v1'
    ]
  })
)
```

**Lambda Layer for FFmpeg (for post-processing):**
```typescript
import { LayerVersion } from 'aws-cdk-lib/aws-lambda'

const ffmpegLayer = LayerVersion.fromLayerVersionArn(
  stack,
  'FFmpegLayer',
  'arn:aws:lambda:us-east-1:123456789012:layer:ffmpeg:1'
)

soulEngine.resources.lambda.addLayers(ffmpegLayer)
```

**Lambda Configuration:**
- Memory: 3008 MB (video processing is memory-intensive)
- Timeout: 300 seconds (5 minutes for video generation + processing)
- Ephemeral storage: 3072 MB (for temporary video files)

**Environment Variables:**
```typescript
soulEngine.resources.lambda.addEnvironment('VIDEO_MODEL', 'nova-canvas') // or 'nova-reel' or 'stable-diffusion'
soulEngine.resources.lambda.addEnvironment('VIDEO_DURATION', '6')
soulEngine.resources.lambda.addEnvironment('VIDEO_FPS', '24')
```

---

### Response Format

**Q: What does the video API response look like for multi-state generation?**

**A:** Generate each state separately with state-specific prompts:

**Nova Canvas (Image-to-Video) - Idle State:**
```typescript
const idleVideo = await bedrockClient.send(new InvokeModelCommand({
  modelId: 'amazon.nova-canvas-v1:0',
  contentType: 'application/json',
  accept: 'application/json',
  body: JSON.stringify({
    taskType: 'IMAGE_VIDEO',
    imageToVideoParams: {
      image: base64CharacterImage, // Same base image for all states
      text: 'Gentle breathing animation, subtle idle movement, calm and peaceful, minimal motion'
    },
    videoGenerationConfig: {
      durationSeconds: 4,
      fps: 24,
      seed: 12345 // Use same seed for consistency
    }
  })
}))
```

**Nova Canvas (Image-to-Video) - Talking State:**
```typescript
const talkingVideo = await bedrockClient.send(new InvokeModelCommand({
  modelId: 'amazon.nova-canvas-v1:0',
  body: JSON.stringify({
    taskType: 'IMAGE_VIDEO',
    imageToVideoParams: {
      image: base64CharacterImage, // Same base image
      text: 'Animated speaking, mouth moving, expressive gestures, active conversation, friendly communication'
    },
    videoGenerationConfig: {
      durationSeconds: 4,
      fps: 24,
      seed: 12345
    }
  })
}))
```

**Nova Canvas (Image-to-Video) - Thinking State:**
```typescript
const thinkingVideo = await bedrockClient.send(new InvokeModelCommand({
  modelId: 'amazon.nova-canvas-v1:0',
  body: JSON.stringify({
    taskType: 'IMAGE_VIDEO',
    imageToVideoParams: {
      image: base64CharacterImage,
      text: 'Pondering, looking up thoughtfully, hand on chin, processing information, contemplative'
    },
    videoGenerationConfig: {
      durationSeconds: 4,
      fps: 24,
      seed: 12345
    }
  })
}))
```

**Nova Canvas (Image-to-Video) - Excited State:**
```typescript
const excitedVideo = await bedrockClient.send(new InvokeModelCommand({
  modelId: 'amazon.nova-canvas-v1:0',
  body: JSON.stringify({
    taskType: 'IMAGE_VIDEO',
    imageToVideoParams: {
      image: base64CharacterImage,
      text: 'Energetic movement, jumping with joy, arms raised in celebration, big smile, enthusiastic'
    },
    videoGenerationConfig: {
      durationSeconds: 4,
      fps: 24,
      seed: 12345
    }
  })
}))
```

**Processing and Upload:**
```typescript
// Extract video from response
const result = JSON.parse(new TextDecoder().decode(idleVideo.body))
const base64Video = result.video
const videoBuffer = Buffer.from(base64Video, 'base64')

// Upload to S3 with state-specific path
await s3Client.send(new PutObjectCommand({
  Bucket: 'toolstoy-character-images',
  Key: `personas/${personaId}/states/idle.mp4`,
  Body: videoBuffer,
  ContentType: 'video/mp4'
}))

// Repeat for all states (talking, thinking, greeting, etc.)
```

**Batch Generation Strategy:**
```typescript
// Generate all states in parallel for faster processing
const states = ['idle', 'talking', 'thinking', 'greeting', 'happy', 'confused', 'excited', 'listening']
const statePrompts = {
  idle: 'Gentle breathing, minimal movement, calm',
  talking: 'Animated speaking, mouth moving, expressive',
  thinking: 'Pondering, looking up, hand on chin',
  greeting: 'Waving hand, friendly smile, welcoming',
  happy: 'Jumping with joy, big smile, enthusiastic',
  confused: 'Head tilt, scratching head, puzzled',
  excited: 'Energetic movement, arms raised, celebration',
  listening: 'Nodding, attentive, focused gaze'
}

const videoPromises = states.map(state => 
  generateStateVideo(base64Image, state, statePrompts[state])
)

const videos = await Promise.all(videoPromises)
```

---

### Recommended Approach

**Phase 1: Static Images Only**
- Implement Titan Image Generator
- Validate quality and costs
- Get user feedback on character designs
- **Timeline: 7-11 days**

**Phase 2: Basic State Animations (4 states)**
- Implement Nova Canvas Image-to-Video
- Generate 4 basic states: idle, talking, thinking, greeting
- Add state-switching logic to widget
- Test with Free plan users
- **Timeline: +7-10 days**
- **Cost: $0.20 per character (4 videos)**

**Phase 3: Pro State Animations (8 states)**
- Add 4 emotional states: happy, confused, excited, listening
- Implement sentiment detection for state triggering
- Add confidence-based state switching
- Test with Pro plan users
- **Timeline: +5-7 days**
- **Cost: $0.40 per character (8 videos)**

**Phase 4: Enterprise State Animations (12 states)**
- Add 4 advanced states: sad, surprised, confident, farewell
- Implement context-aware state triggering
- Add custom state configuration per character
- Offer Nova Reel for cinematic quality
- **Timeline: +5-7 days**
- **Cost: $0.60 per character (12 videos)**

**Phase 5: Advanced Features**
- Background removal for all states
- Seamless looping with frame blending
- WebM format for better compression
- Custom state creation (user uploads reference video)
- **Timeline: +10-14 days**

**Critical Requirements:**
- ✅ Always use Image-to-Video (never Text-to-Video)
- ✅ Use same base image for all states (consistency)
- ✅ Use same seed for all states (visual coherence)
- ✅ Generate states in parallel (faster processing)
- ✅ Store states in JSONB for flexible schema

**Total Timeline:**
- Phase 1 (Images): 7-11 days
- Phase 2 (4 states): +7-10 days = 14-21 days total
- Phase 3 (8 states): +5-7 days = 19-28 days total
- Phase 4 (12 states): +5-7 days = 24-35 days total
- Phase 5 (Advanced): +10-14 days = 34-49 days total

---

## Summary: Multi-State Video System

| Feature | Static Image | 4-State System | 8-State System | 12-State System |
|---------|-------------|----------------|----------------|-----------------|
| Cost per Character | $0.008 | $0.208 | $0.408 | $0.608 |
| Generation Time | 5-10 sec | 3-5 min | 6-8 min | 9-12 min |
| Total File Size | 50-200 KB | 1.2-2.4 MB | 2.4-4.8 MB | 3.6-7.2 MB |
| States Included | N/A | Basic (4) | Basic + Emotional (8) | Full Suite (12) |
| Plan Tier | All | Free | Pro | Enterprise |
| Use Cases | Static preview | Basic chat | Emotional chat | Advanced AI |
| Widget Experience | Static | Interactive | Highly engaging | Cinematic |

**State Breakdown by Tier:**

**Free (4 states) - $0.20:**
- Idle, Talking, Thinking, Greeting

**Pro (8 states) - $0.40:**
- Free states + Happy, Confused, Excited, Listening

**Enterprise (12 states) - $0.60:**
- Pro states + Sad, Surprised, Confident, Farewell

**Cost Comparison (50 characters):**
| Tier | Nova Canvas | Stable Diffusion | Savings |
|------|-------------|------------------|---------|
| Free (4 states) | $10.00 | $20.00 | 50% |
| Pro (8 states) | $20.00 | $40.00 | 50% |
| Enterprise (12 states) | $30.00 | $60.00 | 50% |

**Final Recommendation:** 
1. **Phase 1:** Static images only (Titan Image Generator) - $0.008/char
2. **Phase 2:** Add 4 basic states (Nova Canvas Image-to-Video) - $0.208/char
3. **Phase 3:** Expand to 8 emotional states for Pro tier - $0.408/char
4. **Phase 4:** Full 12-state system for Enterprise - $0.608/char
5. **Skip:** Text-to-video (inconsistent characters), Stable Diffusion (2x cost)

**Why Multi-State Image-to-Video is Required:**
- ✅ All states start from same base image (visual consistency)
- ✅ Character looks identical across all animations
- ✅ First frame of every video = static image exactly
- ✅ Users see cohesive character personality
- ✅ Enables rich, context-aware chat experiences
- ❌ Text-to-video would generate 12 different-looking characters

**Why Nova Canvas Image-to-Video wins:**
- 50% cheaper than Stable Diffusion ($0.05 vs $0.10 per video)
- Longer duration (4-6 seconds vs 4 seconds fixed)
- Better resolution (1280x720 vs 1024x576)
- More motion control (adjust intensity per state)
- Same consistency guarantee as Stable Diffusion
- Scales economically for multi-state system
