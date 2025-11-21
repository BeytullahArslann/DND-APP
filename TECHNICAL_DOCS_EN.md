# Technical Documentation

This document comprehensively covers the project's technical details, architectural decisions, technologies used, and development processes. It is prepared to guide the development team.

## 1. Introduction

This project is a **React**-based, cross-platform (Web, Desktop, Mobile) application. It offers a system where users can create and manage rooms and engage in real-time interactions (chat, dice rolling, etc.). It uses **Firebase** infrastructure for data storage and authentication.

## 2. Tech Stack

The project is built on modern web technologies:

*   **Language:** TypeScript
*   **Frontend Framework:** React 18
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API
*   **Backend / BaaS:** Firebase (Authentication, Firestore, Storage)
*   **Test:** Vitest, React Testing Library
*   **Mobile:** Capacitor (Android & iOS)
*   **Desktop:** Electron

### Versions
*   Node.js: LTS version recommended.
*   React: ^18.3.1
*   Electron: ^33.2.0
*   Capacitor: ^7.4.4

## 3. Project Structure

The project directory structure is as follows:

```
/
├── android/            # Capacitor Android project
├── electron/           # Electron main process codes
├── ios/                # Capacitor iOS project
├── src/                # Application source codes
│   ├── components/     # UI components (atomic and reusable)
│   ├── constants/      # Constant values
│   ├── context/        # Global state management (Auth, Toast, etc.)
│   ├── hooks/          # Custom React hooks (useRoom, etc.)
│   ├── layouts/        # Page layouts (MainLayout, etc.)
│   ├── lib/            # Library configurations (firebase.ts, etc.)
│   ├── pages/          # Application pages (Route targets)
│   ├── services/       # Business logic and data access layer
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── verification/       # Verification scripts
├── capacitor.config.ts # Capacitor settings
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

## 4. Architecture and Design Patterns

The project follows specific patterns to facilitate maintenance and prevent code duplication.

### 4.1. Service Layer Pattern
Database operations and complex business logic are separated from UI components. Files under `src/services/` communicate directly with Firestore.

*   **Example:** `roomService.ts`, `userService.ts`
*   **Goal:** UI components should not know where the data comes from, only how to use it. This increases testability.

### 4.2. Context API & Provider Pattern
React Context API is used for global state management.
*   **AuthContext:** Manages the user's session state (`user`, `loading`, `error`).
*   **ToastContext:** Used to show notifications (toasts) throughout the application.

### 4.3. Custom Hooks
Repeated logic is encapsulated in custom hooks.
*   **useRoom:** Encapsulates data and operations belonging to a room.

## 5. Data Model and Database

**Firestore** (NoSQL) is used as the database. Data is isolated under the `artifacts` collection. This structure allows for `appId` (application ID) based multi-tenancy or environment isolation.

### Schema Structure

```
artifacts/
  └── {appId}/           # Environment or application ID (e.g., "default", "prod")
      ├── users/         # User profiles
      │   └── {uid}      # Document: { displayName, photoURL, ... }
      ├── rooms/         # Game rooms
      │   └── {roomId}   # Document: { name, ownerId, members, ... }
      └── public/        # Publicly shared data
```

### Important Database Rules
*   The application determines which subtree (`artifacts/{appId}`) to work in using the `VITE_APP_ID` environment variable.
*   Security rules (Firestore Rules) should generally be configured to allow only authorized users to access their own data or rooms they are members of.

## 6. Setup and Development Process

Follow these steps to run the project in a local environment.

### 6.1. Preparation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### 6.2. Environment Variables
The project requires environment variables for Firebase configuration. Create a `.env` file (or define it in the CI/CD environment):

*   `VITE_FIREBASE_CONFIG`: The JSON string representation of the Firebase configuration object.
*   `VITE_APP_ID`: Application ID for database isolation (default: `default`).

> **Note:** If `VITE_FIREBASE_CONFIG` is not defined, the application automatically starts in **Demo Mode** (with an ineffective configuration).

### 6.3. Running
*   **Web:** `npm run dev`
*   **Electron (Dev):** `npm run electron:dev`
*   **Android:** `npm run cap:android` (Requires Android Studio)

## 7. Testing Strategy

Tests are an integral part of the development process. **Vitest** is used.

*   **Unit Tests:** Logic-containing files such as `src/services`, `src/utils` should be tested. Test files are located in the `__tests__` folder next to the source file.
*   **Running:**
    ```bash
    npm run test        # Runs all tests once
    npm run test:ui     # Watches tests with UI interface
    ```
*   **Rule:** Code submission (push/merge) should not be performed without the `npm run test` command completing without errors.

## 8. Build and Deployment

### Web (GitHub Pages)
Automatic deployment is done via GitHub Actions workflows. The build process runs the `npm run build` command and creates the `dist/` folder.

### Desktop (Electron)
The `npm run electron:build` command performs both the Vite build process and produces the appropriate file (exe, dmg, AppImage) for the operating system using `electron-builder`.

### Mobile (Capacitor)
After web assets are built, they are synchronized to native projects:
```bash
npm run build
npx cap sync
```
Then, the build is taken via the native IDE (Android Studio / Xcode).

## 9. Points to Consider and Tips

1.  **Mobile Safe Areas:**
    *   `env(safe-area-inset-*)` CSS variables are defined in `tailwind.config.cjs` for iOS notched screens. Use classes like `pt-safe`, `pb-safe`.

2.  **Firebase Config Errors:**
    *   If the application does not open or data does not come, check the console for warnings about `VITE_FIREBASE_CONFIG`. Make sure the JSON format is correct.

3.  **Import Paths:**
    *   Relative paths or defined aliases should be used instead of absolute paths (e.g., `src/components/...`) where possible (currently the project structure uses relative paths).

4.  **Types:**
    *   Avoid using `any`. Use types defined under `src/types/` (e.g., `UserProfile`, `Room`).

## 10. How-To? (Common Operations)

### Adding a New Service
1.  Create a new file under `src/services/` (e.g., `chatService.ts`).
2.  Define Firestore references.
3.  Export the functions.
4.  Definitely write tests in the `__tests__` folder.

### Adding a New Page
1.  Create the component under `src/pages/`.
2.  Add the new route to the `createBrowserRouter` array in the `src/App.tsx` file.

### Making Changes Related to Electron
1.  If you are going to write code on the Node.js side (Main Process), edit `electron/main.js` (or related files).
2.  If you are going to make changes on the UI side, work in the `src/` folder; Electron acts just like a web wrapper.
