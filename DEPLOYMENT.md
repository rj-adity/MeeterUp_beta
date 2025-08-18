# 🚀 MeeterUp Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

✅ **Configuration Files Ready:**
- `vercel.json` - Root configuration for full-stack deployment
- `package.json` - Build scripts configured
- `frontend/env.production.example` - Environment variables template

✅ **Duplicate Files Removed:**
- `backend/vercel.json` - Removed (not needed)
- `frontend/vercel.json` - Removed (not needed)

## 🎯 **Deployment Steps**

### Step 1: Set Up New GitHub Repository
```bash
# Create a new repository on GitHub (don't initialize with README)
# Then set up your local project with the new remote:

# Remove old remote (if exists)
git remote remove origin

# Add new remote (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO.git

# Push to new repository
git add .
git commit -m "Ready for Vercel deployment - integrated full-stack setup"
git push -u origin main
```

### Step 2: Deploy to Vercel
```bash
# Navigate to root directory
cd C:\Users\adity\OneDrive\Desktop\MeeterUp

# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 3: Set Environment Variables in Vercel Dashboard
Go to your Vercel project → Settings → Environment Variables

**Add these variables:**
```
STEAM_API_KEY=ruysyx7st7pe
STEAM_API_SECRET=2fy83reppneed76d6cqfzpkm399amr22d3m426dwdv5s49jzg4w4qxqyj6x66wdu
JWT_SECRET_KEY=E9L/Fd8nw7z61vWyTLP8GzeEdilzdwA9FLmuxiN/8o4=5s49jzg4w4qxqyj6x66wdu
MONGO_URI=mongodb+srv://2022617520aditya:3Z8GX2g0zGAGtAkT@cluster0.hn8eazk.mongodb.net/meeterup_db?retryWrites=true&w=majority
NODE_ENV=production
```

## 🔧 **How It Works**

### **Build Process:**
1. Vercel runs `npm run build` from root
2. Installs backend dependencies
3. Installs frontend dependencies  
4. Builds frontend to `frontend/dist/`
5. Backend serves the built frontend

### **Routing:**
- `/api/*` → Backend API (Node.js)
- `/*` → Frontend SPA (React)

### **Integration Benefits:**
- ✅ No CORS issues
- ✅ Single deployment
- ✅ Automatic frontend serving
- ✅ SPA routing works perfectly

## 📱 **Features Ready for Production**

- ✅ **User Authentication** (JWT + cookies)
- ✅ **Stream Chat** with location sharing
- ✅ **Video Calls** (Stream Video)
- ✅ **Friend Management**
- ✅ **Mobile Responsive** (DaisyUI + Tailwind)
- ✅ **Profile Management**
- ✅ **Real-time Notifications**

## 🚨 **Important Notes**

1. **HTTPS Required** - Vercel provides this automatically
2. **Location Sharing** - Works only over HTTPS
3. **WebSocket Connections** - Stream Chat will work properly
4. **MongoDB Atlas** - Ensure your cluster allows Vercel IPs

## 🔄 **After Deployment**

1. **Test all features:**
   - User registration/login
   - Chat functionality
   - Location sharing
   - Video calls
   - Friend requests

2. **Monitor:**
   - Vercel Analytics
   - Stream Chat dashboard
   - MongoDB performance

## 📞 **Need Help?**

- **Vercel Docs**: https://vercel.com/docs
- **Stream Chat**: https://getstream.io/chat/docs/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

**Ready to deploy! 🚀 Push to GitHub and run `vercel --prod` from the root directory.**
