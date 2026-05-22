# Bird Alarm

A React Native app that wakes you up with a daily bird video.

## Local Development

### Prerequisites

- Node.js
- Docker (for LocalStack)
- [LocalStack](https://localstack.cloud/) running on port 4566
- `awslocal` CLI (`pip install awscli-local`)
- AWS SAM CLI — install via the [official installer](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) rather than pip to avoid boto3 dependency conflicts

### Frontend

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to point at the local SAM API:

- **Browser testing:** use `localhost`
  ```
  EXPO_PUBLIC_API_URL=http://localhost:3000
  ```

- **Physical device via WiFi:** use your laptop's LAN IP address instead — `localhost` on the phone refers to the phone itself, not your laptop. Find your LAN IP from the SAM startup output (`Running on http://<LAN-IP>:3000`) or with `ip addr`.
  ```
  EXPO_PUBLIC_API_URL=http://<your-laptop-LAN-IP>:3000
  ```
  > **Note:** Some networks (public WiFi, corporate, university) enable AP isolation, which blocks device-to-device traffic. If the phone times out connecting to the laptop, use USB tethering instead (see below).

- **Physical device via USB tethering (recommended):** avoids WiFi AP isolation and gives a stable IP that doesn't change between sessions.
  1. Connect the phone to the laptop via USB
  2. On Android: **Settings → Network & Internet → Hotspot & Tethering → USB tethering** (toggle on)
  3. Find the new interface IP on the laptop: `ip addr show` — look for a new interface (e.g. `enp0s20f0u5...`) with a `10.x.x.x` address
  4. Set `EXPO_PUBLIC_API_URL` to that IP:
     ```
     EXPO_PUBLIC_API_URL=http://<usb-tethering-ip>:3000
     ```

> **Important:** `EXPO_PUBLIC_*` variables are bundled at Metro start time. After changing `.env`, restart Expo with `--reset-cache`:
> ```bash
> npm start -- --reset-cache
> ```

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

awslocal s3 mb s3://bird-alarm-local
awslocal s3 cp /home/mike/Videos/yellow-headed.mp4 s3://bird-alarm-local/videos/yellow-headed.mp4
awslocal s3 cp /home/mike/Pictures/Screenshots/yellow-headed-caracara.png s3://bird-alarm-local/thumbnails/yellow-headed-caracara.png
awslocal s3 cp videos.json s3://bird-alarm-local/videos.json
```

#### 4. Build the Lambda

```bash
cd backend/functions/daily-video
npm install
npm run build
cd ../..
```

#### 5. Open port 3000 in the firewall (Linux only)

Required for physical device testing. On Fedora/RHEL with `firewalld`:

```bash
sudo firewall-cmd --add-port=3000/tcp --zone=public
```

#### 6. Start the local API with SAM

Run from the `backend/` directory. `--host 0.0.0.0` is required when testing on a physical device so SAM accepts connections from your local network.

```bash
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test sam local start-api \
  -t template.yaml \
  --host 0.0.0.0 \
  --parameter-overrides \
    "S3BucketName=bird-alarm-local \
     CloudFrontBaseUrl=http://localhost:4566/bird-alarm-local \
     LocalStackEndpoint=http://172.17.0.1:4566"
```

> **Note:** `172.17.0.1` is the Docker bridge gateway IP on Linux — this lets the Lambda container reach LocalStack on the host. On Mac, use `host.docker.internal` instead.

> **Note:** `LocalStackEndpoint` is passed as a SAM template parameter rather than via `--env-vars`, because SAM strips `AWS_ENDPOINT_URL` from the Lambda container environment. The Lambda code reads `LOCALSTACK_ENDPOINT` and passes it explicitly to the AWS SDK clients.

The API will be available at `http://localhost:3000` (or `http://<LAN-IP>:3000` for device access).

#### Verify the API is working

```bash
curl "http://localhost:3000/daily-video?device_id=00000000-0000-0000-0000-000000000001"
```

### Local Architecture

```
Browser / Expo Go / Dev Build
      │
      ▼
Expo dev server (port 8081)
      │  EXPO_PUBLIC_API_URL
      │  (localhost:3000 for browser, <LAN-IP>:3000 for device)
      ▼
SAM local API (0.0.0.0:3000)
      │
      ▼
Lambda container (Docker)
      │
      ├──► LocalStack S3 (172.17.0.1:4566)       — reads videos.json manifest
      └──► LocalStack DynamoDB (172.17.0.1:4566)  — reads/writes device history
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
