# Canvas Backend - Vercel Deployment Guide

This repository contains a Canvas Builder application backend, configured for deployment on Vercel.

## Deployment Instructions

1. Connect your GitHub repository to Vercel
2. Configure the following environment variables in Vercel dashboard:
   - `FRONTEND_URL`: Your frontend URL (e.g., https://canvas-project-silk.vercel.app)
   - `NODE_ENV`: Set to "production"
3. Deploy the application

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables
4. Run the development server: `npm run dev`

## Troubleshooting

If you encounter 500 errors:

1. Check Vercel function logs in the dashboard
2. Ensure all environment variables are correctly set
3. Make sure the frontend URL in CORS configuration matches your actual frontend URL
