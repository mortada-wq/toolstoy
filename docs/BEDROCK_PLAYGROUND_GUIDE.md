# Bedrock Playground Guide

## Overview

The Bedrock Playground is an admin-only testing interface for experimenting with AWS Bedrock image and video generation before implementing it in the Soul Engine.

## Access

**URL:** `/admin/playground`

**Requirements:**
- Admin user account
- Authenticated session

## Features

### 1. Image Generation Testing

Test static character image generation with two models:

**Amazon Titan Image Generator ($0.008)**
- Fast generation (5-10 seconds)
- Good quality for character designs
- Recommended for production

**Stable Diffusion XL ($0.04)**
- Higher quality, more artistic
- 5x more expensive
- Optional premium tier

**Workflow:**
1. Select "Image Generation" mode
2. Choose model (Titan or Stable Diffusion)
3. Enter character prompt
4. Click "Generate Image"
5. View result and download

### 2. Multi-State Video Generation Testing

Test the complete multi-state animation system:

**Available Models:**
- **Nova Canvas** ($0.05, 4-6 sec) - Recommended
- **Nova Reel** ($0.08, 6 sec) - Cinematic quality
- **Stable Diffusion** ($0.10, 4 sec) - Legacy

**Animation States:**
- **Basic (Free tier):** Idle, Talking, Thinking, Greeting
- **Emotional (Pro tier):** Happy, Confused, Excited, Listening
- **Advanced (Enterprise):** Sad, Surprised, Confident, Farewell

**Workflow:**
1. Select "Video Generation (Multi-State)" mode
2. Choose video model
3. Select animation states (1-12)
4. Enter base character description
5. Click "Step 1: Generate Base Image"
6. Wait for image generation
7. Click "Step 2: Generate State Videos"
8. Watch progress as each state generates
9. Preview all videos with playback controls

### 3. Cost Estimation

Real-time cost calculator shows:
- Per-generation cost
- Total cost for selected states
- Comparison across models

### 4. Generation Logs

Terminal-style log viewer shows:
- Generation start/completion
- Current state being processed
- Errors and warnings
- Timestamps for debugging

## Current Implementation Status

**Phase 1: UI Only (Current)**
- ✅ Complete UI with all controls
- ✅ Model selection
- ✅ State selection
- ✅ Cost estimation
- ✅ Log viewer
- ⏳ Mock data (placeholder images/videos)
- ❌ No actual Bedrock API calls yet

**Phase 2: Backend Integration (Next)**
- Create Lambda function for Bedrock API calls
- Add IAM permissions for Bedrock access
- Implement image generation endpoint
- Implement video generation endpoint
- Add S3 upload for results
- Replace mock data with real generations

## Testing Workflow

### Test Image Generation
1. Navigate to `/admin/playground`
2. Keep "Image Generation" selected
3. Try both models (Titan vs Stable Diffusion)
4. Test different prompts:
   - Simple: "Friendly robot character"
   - Detailed: "Friendly robot mascot with blue metallic body, standing on white background, professional 3D illustration"
   - Product-specific: "Wise sage character representing organic skincare serum, earthy tones, natural aesthetic"
5. Compare quality and generation time

### Test Multi-State Video System
1. Switch to "Video Generation (Multi-State)"
2. Select Nova Canvas model
3. Select 4 basic states (idle, talking, thinking, greeting)
4. Enter character prompt
5. Generate base image first
6. Generate all 4 state videos
7. Preview each video
8. Test state switching in UI
9. Verify cost calculation ($0.20 for 4 states)

### Test Different State Combinations
1. Free tier: 4 states ($0.20)
2. Pro tier: 8 states ($0.40)
3. Enterprise: 12 states ($0.60)
4. Compare generation times
5. Verify all states generate correctly

## Next Steps for Production

### 1. Create Bedrock Lambda Function
```typescript
// amplify/functions/bedrock-playground/handler.ts
export const handler = async (event) => {
  const { type, model, prompt, states } = JSON.parse(event.body)
  
  if (type === 'image') {
    // Call Bedrock Titan or Stable Diffusion
    // Return base64 image
  }
  
  if (type === 'video') {
    // Generate base image first
    // For each state, call Nova Canvas Image-to-Video
    // Return video URLs
  }
}
```

### 2. Add API Route
```typescript
// amplify/backend.ts
httpApi.addRoutes({
  path: '/api/admin/bedrock/generate',
  methods: [HttpMethod.POST],
  integration: bedrockPlaygroundIntegration,
  authorizer: userPoolAuthorizer, // Admin only
})
```

### 3. Update Frontend API Calls
```typescript
// In BedrockPlayground.tsx
const response = await fetch(`${API_URL}/admin/bedrock/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'image',
    model: 'titan',
    prompt: prompt
  })
})

const { imageUrl } = await response.json()
setGeneratedImage(imageUrl)
```

### 4. Enable Bedrock Access
1. Go to AWS Console → Bedrock
2. Request model access:
   - Amazon Titan Image Generator
   - Amazon Nova Canvas
   - Amazon Nova Reel
   - Stable Diffusion XL (optional)
3. Wait for approval (usually instant)

### 5. Add IAM Permissions
```typescript
bedrockPlaygroundLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:*::foundation-model/amazon.titan-image-generator-v1',
      'arn:aws:bedrock:*::foundation-model/amazon.nova-canvas-v1:0',
      'arn:aws:bedrock:*::foundation-model/amazon.nova-reel-v1:0',
      'arn:aws:bedrock:*::foundation-model/stability.stable-diffusion-xl-v1'
    ]
  })
)
```

## Troubleshooting

**Issue: "Generate" button disabled**
- Ensure prompt is not empty
- For video generation, generate base image first
- Select at least one animation state

**Issue: Generation takes too long**
- Image: 5-10 seconds is normal
- Video: 30-60 seconds per state is normal
- 12 states = 6-12 minutes total

**Issue: Cost seems high**
- Video is 6-12x more expensive than images
- 12 states × $0.05 = $0.60 per character
- Consider starting with 4 basic states only

## Best Practices

1. **Start with images** - Validate character designs before generating videos
2. **Test prompts** - Iterate on prompts with images first (cheaper)
3. **Use Nova Canvas** - 50% cheaper than Stable Diffusion for videos
4. **Generate states incrementally** - Start with 4, expand to 8, then 12
5. **Monitor costs** - Check AWS Cost Explorer regularly
6. **Save successful prompts** - Document what works for future use

## Future Enhancements

- [ ] Save/load prompt templates
- [ ] Batch generation (multiple characters)
- [ ] A/B comparison view
- [ ] Export results to S3
- [ ] Generation history
- [ ] Prompt suggestions based on character type
- [ ] Background removal preview
- [ ] Loop quality checker
- [ ] Cost tracking dashboard
- [ ] Share results with team

---

**Status:** UI Complete, Backend Integration Pending
**Last Updated:** 2026-02-21
