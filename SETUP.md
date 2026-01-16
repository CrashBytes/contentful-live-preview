# Setup Guide

## Quick Start

### Option 1: Interactive Setup (Recommended)

Run the interactive setup wizard:

```bash
./install.sh
```

The wizard will:
- ✅ Prompt you for all required Contentful credentials
- ✅ Validate your inputs
- ✅ Create a properly configured `.env.local` file
- ✅ Provide next steps

### Option 2: Manual Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Contentful credentials:
   - `CONTENTFUL_SPACE_ID` - Your Contentful space ID
   - `CONTENTFUL_DELIVERY_TOKEN` - Content Delivery API token
   - `CONTENTFUL_PREVIEW_TOKEN` - Content Preview API token
   - `CONTENTFUL_PREVIEW_SECRET` - Any random string for security
   - `CONTENTFUL_ENVIRONMENT` - Usually "master" (default)

## Getting Your Contentful Credentials

### 1. Space ID
- Go to your Contentful space
- Click **Settings** → **General settings**
- Copy the **Space ID**

### 2. API Tokens
- Go to **Settings** → **API keys**
- Select your API key (or create a new one)
- Copy both tokens:
  - **Content Delivery API - access token** → `CONTENTFUL_DELIVERY_TOKEN`
  - **Content Preview API - access token** → `CONTENTFUL_PREVIEW_TOKEN`

### 3. Preview Secret
Generate a secure random string:
```bash
openssl rand -hex 32
```

Or use any random password/UUID.

## Installing Dependencies

```bash
npm install
# or
yarn install
```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Setting Up Contentful Preview

To enable live preview in Contentful:

1. Go to **Settings** → **Content preview**
2. Click **Add content preview**
3. Configure:
   - **Name**: Local Preview (or any name you prefer)
   - **URL**: `http://localhost:3000/api/preview?secret=YOUR_PREVIEW_SECRET&slug={entry.fields.slug}`
   - Replace `YOUR_PREVIEW_SECRET` with your actual preview secret

4. Click **Save**

Now when editing entries in Contentful, you'll see a "Open preview" button that opens your local preview.

## Troubleshooting

### "Invalid token" error
- Double-check your API tokens in `.env.local`
- Make sure you're using the correct Space ID
- Verify the tokens are from the correct space

### "No content types found"
- Ensure you have content types created in Contentful
- Check that your Space ID is correct
- Verify your API tokens have proper permissions

### Preview mode not working
- Verify `CONTENTFUL_PREVIEW_SECRET` matches in both `.env.local` and Contentful settings
- Make sure you're using the Preview API token, not the Delivery token
- Check that the preview URL in Contentful includes the secret parameter

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTENTFUL_SPACE_ID` | Yes | Your Contentful space identifier |
| `CONTENTFUL_DELIVERY_TOKEN` | Yes | Token for published content |
| `CONTENTFUL_PREVIEW_TOKEN` | Yes | Token for draft/preview content |
| `CONTENTFUL_PREVIEW_SECRET` | Yes | Secret for securing preview API |
| `CONTENTFUL_ENVIRONMENT` | No | Environment name (default: "master") |
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` | Yes | Public space ID for browser |
| `NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT` | No | Public environment name |

## Next Steps

Once setup is complete:

1. Browse your content types at [http://localhost:3000](http://localhost:3000)
2. Click on any content type to see its entries
3. Click on any entry to view all its fields
4. Use the preview mode in Contentful for live updates

Enjoy! 🚀
