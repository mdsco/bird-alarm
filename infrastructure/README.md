# Bird Alarm — AWS Infrastructure Setup

## Overview

```
Mobile App  →  API Gateway  →  Lambda  →  DynamoDB (device history)
                                       →  S3 (reads manifest)
Mobile App  →  CloudFront  →  S3 (video + thumbnail downloads)
```

---

## 1. S3 Bucket

### Create the bucket
```bash
aws s3 mb s3://bird-alarm-videos --region us-east-1
```

### Block all public access (CloudFront will serve via OAC)
In the AWS Console → S3 → your bucket → Permissions → Block all public access: **ON**

### Upload the manifest
```bash
aws s3 cp infrastructure/sample-manifest.json s3://bird-alarm-videos/videos.json \
  --content-type application/json
```

### Upload videos + thumbnails
Follow this key structure:
```
s3://bird-alarm-videos/
├── videos.json               ← manifest (update this as you add videos)
├── videos/
│   ├── v001.mp4
│   ├── v002.mp4
│   └── ...
└── thumbnails/
    ├── v001.jpg
    ├── v002.jpg
    └── ...
```

```bash
aws s3 cp path/to/v001.mp4 s3://bird-alarm-videos/videos/v001.mp4
aws s3 cp path/to/v001.jpg s3://bird-alarm-videos/thumbnails/v001.jpg
```

---

## 2. CloudFront Distribution

### Create distribution via Console
1. Go to CloudFront → Create distribution
2. **Origin domain**: select your S3 bucket
3. **Origin access**: select **Origin access control settings (OAC)**
   - Create new OAC → Sign requests → Create
4. **Viewer protocol policy**: Redirect HTTP to HTTPS
5. **Cache policy**: CachingOptimized (recommended for large files)
6. **Price class**: Use only North America and Europe (or All, your choice)
7. Click **Create distribution**

### Copy the S3 bucket policy
After creating, CloudFront will show a banner: "Copy policy" → paste it into your S3 bucket policy under Permissions → Bucket policy.

### Note your CloudFront URL
e.g. `https://d1a2b3c4d5e6f7.cloudfront.net` — you'll need this for the SAM deploy.

---

## 3. Deploy the Lambda + API Gateway

### Prerequisites
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Node.js 20+

### Build the Lambda
```bash
cd backend/functions/daily-video
npm install
npm run build
cd ../../..
```

### Deploy with SAM
```bash
cd backend
sam deploy --guided \
  --parameter-overrides \
    S3BucketName=bird-alarm-videos \
    "CloudFrontBaseUrl=https://d1a2b3c4d5e6f7.cloudfront.net"
```

Follow the prompts. SAM will create/update:
- Lambda function `bird-alarm-daily-video`
- HTTP API Gateway
- DynamoDB table `bird-alarm-history`
- IAM roles

### Get your API URL
After deploy, SAM outputs the `ApiUrl`. Copy the `DailyVideoEndpoint` value.

---

## 4. Configure the Mobile App

Create a `.env` file in the project root:
```
EXPO_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

---

## 5. Adding New Videos

1. Upload the `.mp4` and `.jpg` to S3 under `videos/` and `thumbnails/`
2. Add a new entry to `videos.json` with a unique `id`
3. Re-upload `videos.json` to S3:
   ```bash
   aws s3 cp videos.json s3://bird-alarm-videos/videos.json --content-type application/json
   ```
4. The Lambda's in-memory cache refreshes within 5 minutes automatically.

---

## Estimated AWS Costs (100 downloads/day ≈ 3,000/month)

| Service | Usage | Cost |
|---|---|---|
| CloudFront | ~45 GB/month data transfer | ~$3.83/month |
| S3 Storage | ~45 GB (300 × 15 MB videos) | ~$1.04/month |
| S3 Requests | ~3,000 GET + manifest reads | < $0.01/month |
| Lambda | ~3,000 invocations × 15ms | Free tier (~$0) |
| API Gateway | ~3,000 requests | Free tier (~$0) |
| DynamoDB | ~6,000 reads+writes | Free tier (~$0) |
| **Total** | | **~$4–5/month** |

AWS Free Tier covers Lambda, API Gateway, and DynamoDB for the first 12 months. CloudFront has 1 TB/month free for the first 12 months, covering this workload entirely.
