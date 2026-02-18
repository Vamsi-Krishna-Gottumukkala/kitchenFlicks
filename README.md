# KitchenFlicks 🍳

Smart Pantry-to-Plate Recipe App built with React Native + Expo

## Features

- 🔍 **Recipe Discovery** - Browse and search recipes
- 🧊 **Pantry to Plate** - Find recipes based on ingredients you have
- 👨‍🍳 **AI Chef Assistant** - Get cooking help from Gemini AI
- ❤️ **Favorites** - Save your favorite recipes
- 📱 **Offline Support** - Access saved recipes offline

## Quick Start

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password)
3. Enable **Cloud Firestore**
4. Enable **Storage**
5. Copy your config to `src/services/firebase.ts`

### 3. Configure APIs (Optional)

Edit `src/constants/index.ts`:

```typescript
export const API_KEYS = {
  unsplash: "YOUR_UNSPLASH_ACCESS_KEY", // For recipe images
  gemini: "YOUR_GEMINI_API_KEY", // For AI chatbot
};
```

### 4. Run the App

```bash
npm start
```

Then press:

- `a` for Android
- `i` for iOS (Mac only)
- `w` for Web

## Project Structure

```
app/
├── App.tsx                 # Main entry point
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   ├── services/          # API and Firebase services
│   ├── hooks/             # Custom React hooks
│   ├── constants/         # App configuration
│   └── types/             # TypeScript types
└── scripts/
    └── processRecipes.js  # CSV data upload script
```

## Upload Recipe Data (Optional)

```bash
npm install firebase-admin csv-parse
node scripts/processRecipes.js
```

## Tech Stack

- React Native + Expo
- Firebase (Auth, Firestore, Storage)
- TypeScript
- TheMealDB API
- Google Gemini AI

---

Built with ❤️ for KitchenFlicks Final Year Project
