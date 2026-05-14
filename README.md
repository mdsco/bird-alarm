# Bird Alarm

A React Native app that wakes you up with a daily bird video.

## Local Development

### Prerequisites

- Node.js
- Docker (for LocalStack)
- [LocalStack](https://localstack.cloud/) running on port 4566
- `awslocal` CLI (`pip install awscli-local`)
- AWS SAM CLI (`pip install aws-sam-cli`)

### Frontend

Copy `.env.example` to `.env` and point it at the local SAM API:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Start the Expo dev server:

```bash
npm install
npm run web       # browser
npm start         # QR code for Expo Go on phone
```

### Backend (Local AWS via LocalStack + SAM)

#### 1. Start LocalStack

```bash
localstack start -d
```

Verify it's running:

```bash
curl http://localhost:4566/_localstack/health
```

#### 2. Create AWS resources in LocalStack

```bash
# S3 bucket
awslocal s3 mb s3://bird-alarm-local

# DynamoDB table
awslocal dynamodb create-table \
  --table-name bird-alarm-history \
  --attribute-definitions AttributeName=device_id,AttributeType=S \
  --key-schema AttributeName=device_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

#### 3. Upload a test manifest

Create a `videos.json` file (see format below) and upload it:

```bash
awslocal s3 cp videos.json s3://bird-alarm-local/videos.json
```

`videos.json` format:

```json
{
  "videos": [
    {
      "id": "bird-001",
      "species": "Atlantic Puffin",
      "description": "A seabird known for its colorful beak.",
      "file": "videos/puffin.mp4",
      "thumbnail": "thumbnails/puffin.jpg"
    }
  ]
}
```

To serve actual video/thumbnail files, upload them matching the paths in the manifest:

```bash
awslocal s3 cp puffin.mp4 s3://bird-alarm-local/videos/puffin.mp4
awslocal s3 cp puffin.jpg s3://bird-alarm-local/thumbnails/puffin.jpg
```

#### 4. Build the Lambda

```bash
cd backend/functions/daily-video
npm install
npm run build
cd ../..
```

#### 5. Start the local API with SAM

Run from the `backend/` directory:

```bash
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test sam local start-api \ 
  -t template.yaml \
  --host 0.0.0.0 \
  --parameter-overrides \ 
  "S3BucketName=bird-alarm-local \
     CloudFrontBaseUrl=http://localhost:4566/bird-alarm-local \
     LocalStackEndpoint=http://172.17.0.1:4566"
```


> **Note:** `172.17.0.1` is the Docker bridge gateway IP on Linux — this lets the Lambda container (running in Docker) reach LocalStack on the host. On Mac, use `host.docker.internal` instead.

The API will be available at `http://localhost:3000`.

#### Verify the API is working

```bash
curl "http://localhost:3000/daily-video?device_id=00000000-0000-0000-0000-000000000001"
```

### Local Architecture

```
Browser / Expo Go
      │
      ▼
Expo dev server (localhost:8081)
      │  EXPO_PUBLIC_API_URL
      ▼
SAM local API (localhost:3000)
      │
      ▼
Lambda container (Docker)
      │
      ├──► LocalStack S3 (172.17.0.1:4566)   — reads videos.json manifest
      └──► LocalStack DynamoDB (172.17.0.1:4566) — reads/writes device history
```

### Web Limitations

Some features are native-only and are silently skipped in the browser:

| Feature | Web | Native |
|---------|-----|--------|
| Push notifications | ✗ | ✓ |
| Background download task | ✗ | ✓ |
| Local video caching | ✗ | ✓ |
| Device ID via SecureStore | localStorage fallback | ✓ |

## Deploying to AWS

See [backend/template.yaml](backend/template.yaml) for the SAM/CloudFormation infrastructure definition.

```bash
cd backend
sam deploy --guided
```