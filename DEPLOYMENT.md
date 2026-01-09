# 🚀 Deployment Guide

This guide covers deploying the **Backend to Render** and **Frontend to Vercel**.

---

## 🌎 1. Backend Deployment (Render)

1.  **Create a New Web Service**:
    *   Go to [dashboard.render.com](https://dashboard.render.com/).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configuration Settings**:
    *   **Name**: `repo-exchange-backend` (or your choice)
    *   **Root Directory**: `server` ⚠️ (Important!)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `node dist/index.js`

3.  **Environment Variables**:
    *   Add the following variables in the **Environment** tab:
    *   *Note: Use the values from your local `.env`, but update URLs for production.*
        *   `NODE_ENV`: `production`
        *   `NPM_CONFIG_PRODUCTION`: `false` (Required to install TypeScript for build)
        *   `PORT`: `10000`
        *   `MONGODB_URI`: (Your connection string)
        *   `FRONTEND_URL`: (Paste your Vercel URL here AFTER deploying frontend)
        *   `MOVEMENT_RPC_URL`: `https://testnet.movementnetwork.xyz/v1`
        *   `MOVEMENT_CHAIN_ID`: `250`
        *   `MOVEMENT_CONTRACT_ADDRESS`: `0xa492a23821f2f8575d42bbaa3cd65fd4a0afb922c57dc56d78b360a18211f884`
        *   `MOVEMENT_ADMIN_PRIVATE_KEY`: (Your private key starting with 0x)
        *   `X402_FACILITATOR_URL`: `https://facilitator.stableyard.fi`
        *   `VIEW_PRICE_MOVE`: `50000000`
        *   `DOWNLOAD_PRICE_MOVE`: `100000000`
        *   `SKIP_BLOCKCHAIN_VERIFICATION`: `true`

4.  **Deploy**: Click **Create Web Service**. Wait for the build to finish.
    *   Copy the **Backend URL** (e.g., `https://repo-exchange-backend.onrender.com`).

---

## ⚡ 2. Frontend Deployment (Vercel)

1.  **Import Project**:
    *   Go to [vercel.com/new](https://vercel.com/new).
    *   Select your GitHub repository.

2.  **Project Configuration**:
    *   **Framework Preset**: Vite.
    *   **Root Directory**: `.` (Default).
    *   **Build Command**: `vite build` (Default).
    *   **Output Directory**: `dist` (Default).

3.  **Environment Variables**:
    *   Add the following variables:
        *   `VITE_API_URL`: (Paste your Render Backend URL here, e.g., `https://repo-exchange-backend.onrender.com`)
        *   `VITE_PRIVY_APP_ID`: `cmjsp6eev015pk00cfg0sp2qc`
        *   `VITE_MOVEMENT_CHAIN_ID`: `250`
        *   `VITE_BOUNTY_CONTRACT_ADDRESS`: `0xa492a23821f2f8575d42bbaa3cd65fd4a0afb922c57dc56d78b360a18211f884`

4.  **Deploy**: Click **Deploy**.

---

## 🔄 3. Final Connection Step

1.  Once Vercel deployment is complete, copy the **Frontend URL** (e.g., `https://repo-exchange-frontend.vercel.app`).
2.  Go back to **Render Dashboard** -> **Environment**.
3.  Update the `FRONTEND_URL` variable with your new Vercel URL.
4.  **Redeploy** the backend (Manual Deploy -> Deploy latest commit) to apply the CORS change.

✅ **Done!** Your app is now live.
