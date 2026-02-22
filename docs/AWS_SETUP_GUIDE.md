# AWS Setup Guide for Bedrock Integration

## Prerequisites
- AWS Account with admin access
- AWS CLI configured
- Amplify CLI installed

## Step 1: Enable Bedrock Models

### 1.1 Navigate to Bedrock Console
```bash
# Open AWS Console
https://console.aws.amazon.com/bedrock/

# Select region: us-east-1
```

### 1.2 Enable Titan Image Generator
1. Go to "Model access" in left sidebar
2. Click "Manage model access"
3. Find "Amazon Titan Image Generator v1"
4. Check the box next to it
5. Click "Request model access"
6. Wait for approval (usually instant)

### 1.3 Enable Nova Canvas
1. In same "Model access" page
2. Find "Amazon Nova Canvas"
3. Check the box
4. Click "Request model access"
5. Wait for approval

### 1.4 Verify Access
```bash
aws bedrock list-foundation-models --region us-east-1 \
  --query 'modelSummaries[?contains(modelId, `titan-image`) || contains(modelId, `nova-canvas`)]'
```

## Step 2: Create S3 Bucket

### 2.1 Create Bucket
```bash
aws s3 mb s3://toolstoy-character-images --region us-east-1
```

### 2.2 Enable Versioning
```bash
aws s3api put-bucket-versioning \
  --bucket toolstoy-character-images \
  --versioning-configuration Status=Enabled
```

### 2.3 Configure CORS
Create file `s3-cors.json`:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors \
  --bucket toolstoy-character-images \
  --cors-configuration file://s3-cors.json
```

### 2.4 Set Bucket Policy
Create file `s3-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::toolstoy-character-images/*"
  }]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket toolstoy-character-images \
  --policy file://s3-policy.json
```

## Step 3: Create CloudFront Distribution

### 3.1 Create Distribution
```bash
aws cloudfront create-distribution \
  --origin-domain-name toolstoy-character-images.s3.us-east-1.amazonaws.com \
  --default-root-object index.html
```

### 3.2 Note Distribution Domain
Save the CloudFront domain (e.g., `d1234abcd.cloudfront.net`)

### 3.3 Update Environment Variables
Add to Lambda environment:
```bash
CDN_DOMAIN=d1234abcd.cloudfront.net
```

## Step 4: Configure IAM Permissions

### 4.1 Soul Engine Lambda Role
The Lambda execution role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-image-generator-v1",
        "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-canvas-v1:0"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::toolstoy-character-images/personas/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### 4.2 Apply to Lambda
```bash
# Get Lambda role ARN
aws lambda get-function --function-name soul-engine \
  --query 'Configuration.Role'

# Attach inline policy
aws iam put-role-policy \
  --role-name soul-engine-role \
  --policy-name BedrockAccess \
  --policy-document file://lambda-policy.json
```

## Step 5: Database Setup

### 5.1 Run Migrations
```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL

# Run migrations
\i database/migrations/001_bedrock_multi_state_videos.sql
\i database/migrations/002_bedrock_integration.sql
```

### 5.2 Verify Tables
```sql
-- Check tables exist
\dt

-- Verify prompt_templates has default
SELECT * FROM prompt_templates WHERE is_active = true;
```

## Step 6: Configure Environment Variables

### 6.1 Lambda Environment Variables
Add these to all Lambda functions:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
S3_BUCKET=toolstoy-character-images
CDN_DOMAIN=d1234abcd.cloudfront.net
VIDEO_MODEL=amazon.nova-canvas-v1:0
VIDEO_DURATION=6
VIDEO_FPS=24
NODE_ENV=production
```

### 6.2 Update via Amplify
```bash
# Edit amplify/functions/soul-engine/resource.ts
# Add environment variables to defineFunction config
```

## Step 7: Deploy

### 7.1 Install Dependencies
```bash
cd amplify/functions/soul-engine
npm install pg @types/pg @aws-sdk/client-bedrock-runtime @aws-sdk/client-s3
cd ../../..
```

### 7.2 Deploy to Sandbox
```bash
npx ampx sandbox
```

### 7.3 Deploy to Production
```bash
npx ampx pipeline-deploy --branch main
```

## Step 8: Test

### 8.1 Test Database Connection
```bash
aws lambda invoke \
  --function-name soul-engine \
  --payload '{"test": "health-check"}' \
  response.json
```

### 8.2 Test Bedrock Access
```bash
aws bedrock-runtime invoke-model \
  --model-id amazon.titan-image-generator-v1 \
  --body '{"taskType":"TEXT_IMAGE","textToImageParams":{"text":"test"}}' \
  --region us-east-1 \
  output.json
```

### 8.3 Test S3 Upload
```bash
echo "test" > test.txt
aws s3 cp test.txt s3://toolstoy-character-images/test/test.txt
```

## Troubleshooting

### Bedrock Access Denied
- Verify models are enabled in Bedrock console
- Check IAM role has bedrock:InvokeModel permission
- Ensure using us-east-1 region

### S3 Upload Fails
- Check bucket exists and is in us-east-1
- Verify IAM role has s3:PutObject permission
- Check bucket policy allows uploads

### Database Connection Fails
- Verify DATABASE_URL is correct
- Check security group allows Lambda access
- Ensure RDS is in same VPC as Lambda

### CloudFront Not Serving Files
- Wait 15-20 minutes for distribution to deploy
- Check origin is correct S3 bucket
- Verify S3 bucket policy allows CloudFront access

## Cost Estimates

### Bedrock Costs
- Titan Image Generator: $0.008 per image
- Nova Canvas: $0.05 per 6-second video
- Free tier: $0.208 per character (3 images + 4 videos)
- Pro tier: $0.408 per character (3 images + 8 videos)
- Enterprise tier: $0.608 per character (3 images + 12 videos)

### S3 Costs
- Storage: $0.023 per GB/month
- Requests: $0.0004 per 1000 PUT requests
- Data transfer: Free to CloudFront

### CloudFront Costs
- Data transfer: $0.085 per GB (first 10 TB)
- Requests: $0.0075 per 10,000 requests

### Estimated Monthly Cost (1000 characters/month)
- Bedrock: $208 - $608
- S3: ~$5
- CloudFront: ~$10
- Total: ~$223 - $623/month

## Security Best Practices

1. **Enable S3 Bucket Encryption**
```bash
aws s3api put-bucket-encryption \
  --bucket toolstoy-character-images \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

2. **Enable CloudFront HTTPS Only**
- In CloudFront console, set "Viewer Protocol Policy" to "Redirect HTTP to HTTPS"

3. **Rotate IAM Credentials**
- Use IAM roles instead of access keys
- Enable MFA for AWS console access

4. **Monitor Costs**
- Set up AWS Budgets alerts
- Enable Cost Explorer
- Review CloudWatch metrics daily

## Next Steps

1. Test character generation in Bedrock Playground
2. Monitor CloudWatch logs for errors
3. Set up CloudWatch alarms for failures
4. Configure backup strategy for S3
5. Implement cost tracking dashboard
