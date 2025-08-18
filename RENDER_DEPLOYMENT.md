# 🚀 MeeterUp Render Deployment Guide

## 📋 Pre-Deployment Checklist

✅ **Configuration Files Ready:**
- `render.yaml` - Render deployment configuration
- `package.json` - Build scripts configured for Render
- `backend/src/server.js` - Updated for Render deployment

✅ **Vercel Configuration Removed:**
- `vercel.json` - Deleted (not needed for Render)

## 🎯 **Deployment Steps**

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configured for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   **Name:** `meeterup-app`
   **Environment:** `Node`
   **Region:** Choose closest to your users
   **Branch:** `main`
   **Build Command:** `npm run build`
   **Start Command:** `npm start`
   **Plan:** `Free` (or paid if needed)

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
STEAM_API_KEY=ruysyx7st7pe
STEAM_API_SECRET=2fy83reppneed76d6cqfzpkm399amr22d3m426dwdv5s49jzg4w4qxqyj6x66wdu
JWT_SECRET_KEY=E9L/Fd8nw7z61vWyTLP8GzeEdilzdwA9FLmuxiN/8o4=5s49jzg4w4qxqyj6x66wdu
MONGO_URI=mongodb+srv://2022617520aditya:3Z8GX2g0zGAGtAkT@cluster0.hn8eazk.mongodb.net/meeterup_db?retryWrites=true&w=majority
NODE_ENV=production
PORT=3000
```

## 🔧 **How It Works**

### **Build Process:**
1. Render runs `npm run build` from root
2. Installs frontend dependencies
3. Builds frontend to `frontend/dist/`
4. Copies build to `backend/frontend/dist/`
5. Backend serves the built frontend

### **Deployment Benefits:**
- ✅ **Always-on service** (no cold starts)
- ✅ **Custom domain support**
- ✅ **SSL certificates** included
- ✅ **Auto-deploy** on git push
- ✅ **Easy scaling** options

## 📱 **Features Ready for Production**

- ✅ **User Authentication** (JWT + cookies)
- ✅ **Stream Chat** with location sharing
- ✅ **Video Calls** (Stream Video)
- ✅ **Friend Management**
- ✅ **Mobile Responsive** (DaisyUI + Tailwind)
- ✅ **Profile Management**
- ✅ **Real-time Notifications**

## 🚨 **Important Notes**

1. **Free Plan Limitations:**
   - Service sleeps after 15 minutes of inactivity
   - 750 hours/month free
   - 512MB RAM, shared CPU

2. **Environment Variables:**
   - Set all required variables in Render dashboard
   - Never commit sensitive data to git

3. **Database:**
   - MongoDB Atlas works perfectly with Render
   - Ensure your cluster allows Render IPs

## 🔄 **After Deployment**

1. **Test all features:**
   - User registration/login
   - Chat functionality
   - Location sharing
   - Video calls
   - Friend requests

2. **Monitor:**
   - Render logs
   - Stream Chat dashboard
   - MongoDB performance

## 📞 **Need Help?**

- **Render Docs**: https://render.com/docs
- **Stream Chat**: https://getstream.io/chat/docs/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

**Ready to deploy! 🚀 Push to GitHub and create a new Web Service on Render.**
