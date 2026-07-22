# 📁 Komawan - File Management SaaS (Frontend)

Welcome to the Frontend repository for **Komawan**, a modern Software as a Service (SaaS) file management application.

This application is built with **React** and designed to provide a fast, responsive, and secure user experience for managing files, similar to Google Drive.

## ✨ Key Features

- **Secure File Storage**: Safely upload, download, and manage your files.
- **Role-Based Access Control**: Automated quota and limitation management based on user roles (Free vs Pro).
- **Modern User Interface**: A clean, interactive interface for the best file management experience.
- **Supabase Integration**: Fully integrated with Supabase Storage for advanced file storage, secured by Row Level Security (RLS).
- **Real-time Sync**: Secure state synchronization across the Frontend, Supabase, and Laravel Backend.

## 🚀 Tech Stack

- **Framework**: React.js
- **Styling**: Vanilla CSS / Modern UI
- **Storage & RLS**: Supabase
- **HTTP Client**: Axios (connected to Laravel API)
- **State Management**: React Hooks

## 🛠️ Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/baihaqii08/Komawan-FE.git
   cd Komawan-FE
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and populate it with your Supabase and Backend API credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   REACT_APP_API_URL=http://localhost:8000/api/v1
   ```

4. **Run the Application**
   ```bash
   npm start
   ```
   The application will automatically open at `http://localhost:3000`.

## 📦 Deployment

This application is ready to be deployed to modern platforms like **Vercel**, **Netlify**, or **Cloudflare Pages** using the standard build command:
```bash
npm run build
```

---
*Developed for SaaS file management demonstration and evaluation purposes.*
