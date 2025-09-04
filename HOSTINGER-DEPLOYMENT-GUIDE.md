# 🚀 Hostinger Deployment Guide - CRM Project

## 📁 **What to Upload to Hostinger**

### **Frontend (Built Files)**
📂 **Location**: `frontend/dist/` folder
🌐 **Upload to**: Your domain's public_html folder (e.g., admin.gandhibaideaddictioncenter.com)

**Files to upload from `frontend/dist/`:**
```
├── index.html (main entry point)
├── .htaccess (URL routing rules)
├── assets/ (CSS and JS bundles)
├── favicon.ico
├── manifest.json
├── robots.txt
└── All other HTML and JS files
```

### **Backend (Node.js Server)**
📂 **Location**: `backend/` folder
🖥️ **Upload to**: Your server directory (usually separate from public_html)

**Files to upload from `backend/`:**
```
├── index.js (main server file)
├── package.json
├── .env (production environment variables)
├── routes/ (all API routes)
├── db/ (database configuration)
├── uploads/ (user uploaded files)
├── migrations/
├── services/
└── All other backend files
```

## 🔧 **Environment Configuration**

### **Frontend Environment** (Already configured)
Your `frontend/.env` should have:
```
VITE_API_URL=https://crm-czuu.onrender.com/api
VITE_BASE_URL=https://admin.gandhibaideaddictioncenter.com
NODE_ENV=production
```

### **Backend Environment** (Already configured)
Your `backend/.env` should have:
```
DB_HOST=srv1639.hstgr.io
DB_USER=u745362362_crmusername
DB_PASSWORD="Aedentek@123#"
DB_NAME=u745362362_crm
API_PORT=4000
VITE_API_URL=https://crm-czuu.onrender.com/api
VITE_BASE_URL=https://admin.gandhibaideaddictioncenter.com
NODE_ENV=production
```

## 📋 **Step-by-Step Deployment**

### **Option 1: Manual Upload via File Manager**

1. **Frontend Deployment:**
   - Zip the entire `frontend/dist/` folder
   - Login to Hostinger cPanel
   - Go to File Manager
   - Navigate to your domain's public_html folder
   - Upload and extract the zip file
   - Ensure `index.html` is in the root of public_html

2. **Backend Deployment:**
   - Zip the entire `backend/` folder
   - Upload to a separate directory (not public_html)
   - Set up Node.js app in Hostinger
   - Install dependencies: `npm install`
   - Start the server: `node index.js`

### **Option 2: FTP Upload**

1. **Use FTP client (FileZilla, WinSCP)**
2. **Upload frontend/dist/** to public_html
3. **Upload backend/** to separate server directory

## 🔄 **Why Dashboard Changes Aren't Reflecting**

The issue is likely because:

1. **Cache**: Browser/CDN cache showing old version
2. **Manual Deployment**: Hostinger doesn't auto-pull from GitHub
3. **Build Not Updated**: Old build files still deployed

## ✅ **Latest Changes Included in This Build**

- ✅ **Favicon Fix**: Database favicon now loads correctly
- ✅ **Settings Upload**: Users can upload favicon through UI
- ✅ **Dashboard Improvements**: FastCorporateDashboard updates
- ✅ **API Configuration**: Production URLs configured
- ✅ **Route Fixes**: Backend route ordering fixed

## 🎯 **Immediate Action Required**

**YES, you should take a fresh build and upload to Hostinger** because:

1. Your GitHub has all the latest changes
2. The build includes dashboard fixes
3. Favicon functionality is now working
4. Production environment is properly configured

## 📦 **Ready for Upload**

The built files are ready in:
- **Frontend**: `frontend/dist/` (upload to public_html)
- **Backend**: `backend/` (upload to server directory)

## 🔧 **Post-Deployment Steps**

1. **Clear browser cache** after upload
2. **Test favicon** loading from database
3. **Verify dashboard** changes are visible
4. **Check settings** upload functionality
5. **Test API endpoints** are responding

## 🆘 **If Issues Persist**

1. Check browser console for errors
2. Verify API URLs are correct
3. Ensure database connection is working
4. Check server logs for backend issues

**Ready to deploy! The build contains all your latest dashboard changes and favicon fixes.** 🚀
