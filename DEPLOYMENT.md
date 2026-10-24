# 🚀 EchoBuddy Pro — Deployment Guide

This guide explains how to deploy **EchoBuddy Pro** to the cloud so anyone (including hackathon judges, teachers, and users) can open the app on their phone or laptop with **camera & microphone permissions** enabled.

---

## ⚠️ Critical Rule: Why HTTPS is Mandatory
Modern browsers (Chrome, Safari, Edge, Firefox) **strictly block** Camera (`navigator.mediaDevices.getUserMedia`) and Microphone (`webkitSpeechRecognition`) APIs on public HTTP URLs.
* On `http://localhost` or `http://127.0.0.1`, browsers allow camera & mic for local testing.
* On the internet, your app **MUST have an `https://` domain** (SSL certificate).
* All the deployment methods below (**Render, Railway, Hugging Face, Ngrok**) provide **free HTTPS** out of the box!

---

## 🌟 Method 1: Deploy to Render.com (Recommended — 100% Free & 24/7 Live)

Render is the best platform for FastAPI apps because it natively supports **WebSockets**, **asynchronous workers**, and provides **free HTTPS**.

### Step 1: Push Project to GitHub
1. Create a free account on [GitHub.com](https://github.com).
2. Create a new repository named `echobuddy-pro` (Public or Private).
3. Open your terminal inside the `EchoBuddy-Pro` directory:
   ```bash
   cd C:\Users\Asus\.gemini\antigravity\scratch\EchoBuddy-Pro
   git init
   git add .
   git commit -m "Initial commit - EchoBuddy Pro"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/echobuddy-pro.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and sign up / log in with your GitHub account.
2. On your Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** $\rightarrow$ Connect your `echobuddy-pro` repository.
4. Fill in the deployment settings:
   * **Name:** `echobuddy-pro` (or any custom name)
   * **Region:** Singapore / Frankfurt / Oregon (choose closest)
   * **Branch:** `main`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type:** `Free`
5. Click **Deploy Web Service**!
6. In 2–3 minutes, your live URL will be ready:
   👉 `https://echobuddy-pro.onrender.com`

---

## 🌟 Method 2: Instant Hackathon Demo via Ngrok (Live in 60 Seconds)

If you are at the hackathon venue and want judges to test the app on their own phones **right now** without pushing to GitHub or waiting for cloud builds:

1. Download Ngrok from [ngrok.com](https://ngrok.com) (or install via `winget install ngrok`).
2. Start your local server:
   ```bash
   run.bat
   ```
   *(Server starts at `http://localhost:8000`)*
3. In a new terminal window, run:
   ```bash
   ngrok http 8000
   ```
4. Ngrok will give you an instant public HTTPS URL, for example:
   👉 `https://a1b2-c3d4.ngrok-free.app`
5. Open this link on your smartphone or show the QR code to judges! Camera and speech will work immediately.

---

## 🌟 Method 3: Deploy to Hugging Face Spaces (Great for AI Showcases)

Hugging Face Spaces provides free hosting with excellent visibility in the AI community:

1. Sign up on [huggingface.co](https://huggingface.co).
2. Click **New Space** $\rightarrow$ Name: `echobuddy-pro`.
3. Select **Space SDK**: **Docker** (Blank).
4. Clone the space repo locally, copy the `EchoBuddy-Pro` files (including `Dockerfile`), commit, and push:
   ```bash
   git add .
   git commit -m "Deploy EchoBuddy Pro"
   git push
   ```
5. Hugging Face will automatically build the Docker container and give you a permanent `https://huggingface.co/spaces/<user>/echobuddy-pro` link!

---

## 🌟 Method 4: Deploy to Railway.app (1-Click Deployment)

1. Sign up on [Railway.app](https://railway.app) with your GitHub account.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your `echobuddy-pro` repository.
4. Railway automatically detects `Procfile` and `requirements.txt`.
5. Under **Settings** $\rightarrow$ **Networking**, click **Generate Domain** to get a public `https://...up.railway.app` URL.

---

## 🛠️ Verification Checklist After Deployment

Once deployed, test these 3 things on your live HTTPS URL:
1. **Health Check:** Open `https://your-domain/api/v1/health` $\rightarrow$ should return `{"status": "healthy"}`.
2. **Camera Permission:** Click *"📷 Real-Time Camera AI Vision"* $\rightarrow$ browser should prompt for camera access.
3. **Voice Recognition:** Speak *"Find my phone"* or *"What do you see?"* $\rightarrow$ voice assistant should respond out loud.
4. **Pitch Deck:** Open `https://your-domain/static/presentation.html` to view the Team Broxo presentation deck on any device!
