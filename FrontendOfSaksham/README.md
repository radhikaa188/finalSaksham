# Saksham: AI Career Guide

A modern, inclusive AI-powered career discovery platform built with React, featuring voice input, bilingual support (English/Hindi), and dark mode.

## Features

- **Voice Input**: Speak naturally about your education, interests, and goals
- **AI Career Suggestions**: Get personalized career recommendations based on your background
- **Learning Resources**: Curated courses from YouTube and Udemy
- **Job Platforms**: Recommended platforms to find opportunities
- **AI Assistant**: Chat with an AI assistant for follow-up questions
- **Bilingual**: Full support for English and Hindi
- **Dark/Light Mode**: Beautiful glassmorphic UI with theme switching
- **Authentication**: Secure authentication with Clerk

## Tech Stack

- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **React Router** for navigation
- **Lucide React** for icons
- **Context API** for state management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Clerk Authentication

1. Create a free account at [Clerk](https://clerk.com)
2. Create a new application
3. Copy your Publishable Key from the Clerk Dashboard
4. Create a `.env` file in the project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Set up Backend API

This application expects a backend API running at `http://localhost:5000/api` with the following endpoints:

- `POST /api/speech/transcribe` - Transcribe audio and get career suggestions
- `POST /api/courses/suggest` - Get course recommendations
- `POST /api/jobs/platforms` - Get job platform recommendations
- `POST /api/agent/chat` - Chat with AI assistant

All endpoints require Bearer token authentication from Clerk.

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.tsx       # Navigation header with theme/language toggles
│   └── AgentChat.tsx    # AI chat component
├── contexts/            # React contexts
│   ├── ThemeContext.tsx # Dark/Light theme management
│   └── LanguageContext.tsx # English/Hindi language management
├── i18n/                # Internationalization
│   └── translations.ts  # Translation dictionary
├── pages/               # Page components
│   ├── LandingPage.tsx  # Public landing page
│   └── CareerGuidePage.tsx # Protected career guide wizard
├── types/               # TypeScript types
│   └── index.ts         # Shared type definitions
├── App.tsx              # Main app component with routing
├── main.tsx             # App entry point
└── index.css            # Global styles
```

## User Journey

1. **Landing Page**: Users learn about the platform and click "Get Started"
2. **Step 0 - Voice Input**: Users click the mic button and speak about their background
3. **Step 1 - Career Selection**: AI suggests careers based on the audio transcript
4. **Step 2 - Resources**: Users see courses and job platforms for their chosen career
5. **AI Chat**: Users can ask follow-up questions to the AI assistant

## API Integration

### Authentication

All API calls include a Bearer token from Clerk:

```typescript
const token = await getToken();
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Expected API Responses

**POST /api/speech/transcribe**
```json
{
  "transcript": "I have a degree in computer science...",
  "careers": [
    {
      "title": "Full Stack Developer",
      "type": "Job",
      "description": "Build web applications..."
    }
  ]
}
```

**POST /api/courses/suggest**
```json
{
  "courses": [
    {
      "title": "React Complete Guide",
      "platform": "Udemy",
      "url": "https://udemy.com/...",
      "level": "Intermediate"
    }
  ]
}
```

**POST /api/jobs/platforms**
```json
{
  "platforms": [
    {
      "name": "LinkedIn",
      "url": "https://linkedin.com",
      "type": "Professional Network",
      "tip": "Build your professional profile"
    }
  ]
}
```

**POST /api/agent/chat**
```json
{
  "message": "Here's more information...",
  "history": [],
  "newCourses": [],
  "newCareers": [],
  "newJobs": []
}
```

## Customization

### Colors

The app uses a gradient color scheme. To customize, update the Tailwind classes in components:

- Primary: `from-orange-500 to-pink-600`
- Secondary: `from-purple-500 to-blue-600`
- Success: `green-500`

### Translations

Add or modify translations in `src/i18n/translations.ts`:

```typescript
export const translations = {
  new_key: {
    en: 'English text',
    hi: 'हिंदी पाठ'
  }
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires microphone access for voice input

## License

MIT
