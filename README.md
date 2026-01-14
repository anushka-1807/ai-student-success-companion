# AI Student Success Companion

A comprehensive MERN-style application featuring AI-powered tools to help students succeed academically. Built with React (frontend) and Node.js/Express (backend), using **free services only**.

## Features

### 1. Smart Student Dashboard (New)
- Personalized dashboard shown after login
- Uses Firebase Auth user + Firestore `users/{uid}` document
- Shows:
  - Current semester
  - Resume readiness score (from last analysis)
  - Notes coverage (subjects and completion %)
  - SGPA trend (latest SGPA + up/down trend)
  - Weak subject estimate (based on note coverage)
- Visuals:
  - SGPA history line chart (SVG)
  - Notes progress bars per subject
  - Recent activity across all tools
  - "Next Best Action" recommendation based on your data

### 2. AI Resume Analyzer
- Upload PDF/DOCX resumes
- Get AI-powered analysis with:
  - Overall score (0-100)
  - Category scores (format, clarity, achievements, skills, keywords)
  - Keyword recommendations for ATS optimization
  - Section-wise improvement suggestions
- Analysis history stored in Firestore

### 3. AI Notes Generator
- Upload PDF, PPT, or image files
- Automatic text extraction via:
  - **Tesseract.js** (free OCR for images)
  - **pdf-parse** (for PDF documents)
- AI-generated structured notes including:
  - Summary
  - Key points
  - Definitions
  - Concepts with examples
  - Quiz questions
  - Flashcards
  - Study tips

### 4. SGPA Calculator
- Enter marks and credits for each subject
- Automatic grade point calculation:
  - 90+ = 10 (O)
  - 80-89 = 9 (A+)
  - 70-79 = 8 (A)
  - 60-69 = 7 (B+)
  - 50-59 = 6 (B)
  - 45-49 = 5 (C)
  - 40-44 = 4 (P)
  - <40 = 0 (F)
- SGPA formula: `SGPA = Σ(Ci × Gi) / Σ(Ci)`
- Detailed breakdown per subject

### 5. Skill Analysis with Industry Trends (New UI)
- Track your skills and target careers
- Local skill & career goals storage (per browser)
- Automatic skill gap detection for chosen careers
- Industry trends section with:
  - Mocked trend data for Technology, Healthcare, Finance, Marketing
  - Demand %, growth, salary range per skill
  - Demand progress bars and a compact SVG line chart visualizing demand across top skills

### 6. History & Activity
- Unified history page for:
  - Resume analyses
  - Generated notes
  - SGPA calculations
- Uses backend `/api/history` endpoint + Firestore
- Dashboard surface shows a compact "Recent Activity" preview

### 7. Gen‑Z Focused UI/UX (New)
- Fully responsive, mobile‑first layout
- Light & Dark mode via Tailwind `dark` class and a theme toggle
- Tailwind-based design system:
  - Primary: violet / indigo (AI brand)
  - Secondary: teal / cyan
  - Success / warning / danger scales
  - Surface tokens for backgrounds and cards
- Modern components:
  - Gradient/glass buttons with smooth hover scale + glow
  - Elevated/glass cards with subtle motion
  - Drag‑and‑drop styled file upload
  - App-like login screen with feature highlights

## Tech Stack (All Free!)

### Frontend
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Lucide React (icons)
- Axios
- Firebase Auth (Google Sign-In) - **Free tier**

### Backend
- Node.js + Express
- Firebase Admin SDK - **Free tier**
- **Local file storage** (no cloud storage needed)
- **Tesseract.js** - Free OCR
- **pdf-parse** - Free PDF text extraction
- Google Generative AI (Gemini) - **Free tier available**
- Multer (file uploads)
- Firestore (database) - **Free tier**

## Project Structure

```
ai-student-success-companion/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ScoreCircle.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotesGenerator.jsx
│   │   │   ├── ResumeReport.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   └── SGPACalculator.jsx
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── backend/
    ├── src/
    │   ├── controllers/
    │   │   ├── notesController.js
    │   │   ├── resumeController.js
    │   │   └── sgpaController.js
    │   ├── middleware/
    │   │   └── authMiddleware.js
    │   ├── services/
    │   │   ├── storageService.js   # Local file storage
    │   │   ├── llmService.js       # Gemini AI
    │   │   ├── speechService.js    # Audio transcription
    │   │   └── visionService.js    # Tesseract.js OCR
    │   └── index.js
    ├── .env.example
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Firebase project (free tier) with:
  - Authentication enabled (Google provider)
  - Firestore database
- Gemini API key (free at https://aistudio.google.com/)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   PORT=5000
   
   # Firebase Admin SDK (get from Firebase Console > Project Settings > Service Accounts)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
  
   GROQ_API_KEY=your-groq-api-key
   
   # Local file storage directory
   UPLOAD_DIR=./uploads
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_API_URL=http://localhost:5000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-resume` | Upload resume and extract text |
| POST | `/api/analyze-resume` | Analyze resume with Gemini AI |
| POST | `/api/generate-notes` | Generate notes from uploaded file |
| POST | `/api/calculate-sgpa` | Calculate SGPA from marks/credits |
| GET | `/api/history?type=` | Get user's history (resume/notes/sgpa) |
| GET | `/api/health` | Health check endpoint |

## Firebase Security Rules

Add these Firestore security rules to ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Deploying to Render (Free)

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and create both services

### Option 2: Manual Deployment

#### Deploy Backend (Web Service)

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `ai-student-companion-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `FIREBASE_PROJECT_ID` | Your Firebase project ID |
   | `FIREBASE_PRIVATE_KEY` | Your private key (with `\n` for newlines) |
   | `FIREBASE_CLIENT_EMAIL` | Your service account email |
   | `GROOQ` | Your Gemini API key |
   | `FRONTEND_URL` | `https://your-frontend.onrender.com` |
   | `UPLOAD_DIR` | `/tmp/uploads` |

#### Deploy Frontend (Static Site)

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `ai-student-companion-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` |
   | `VITE_FIREBASE_API_KEY` | Your Firebase API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
   | `VITE_FIREBASE_APP_ID` | Your app ID |

5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`

### Post-Deployment

1. Update `FRONTEND_URL` in backend with your actual frontend URL
2. Update `VITE_API_URL` in frontend with your actual backend URL
3. Add your Render frontend URL to Firebase Auth authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains

### Important Notes

- **Free tier**: Services spin down after 15 mins of inactivity (cold start ~30s)
- **File storage**: Uses `/tmp` which is ephemeral (files deleted on restart)
- **For persistent storage**: Consider upgrading or using external storage
