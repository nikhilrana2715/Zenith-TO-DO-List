# 🌌 Zenith Task

**Zenith Task** is a premium, feature-rich, and visually stunning To-Do List & Task Management application built from the ground up to offer desktop web capability and a native Android mobile experience. 

Designed with a modern, glassmorphic dark aesthetic, it features robust task classification, custom-synthesized sound alarms, offline reminder persistence, and automated cloud deployment workflows.

---

## ✨ Features

- **💎 Glassmorphic Dark UI**: Translucent panels with background blur, deep drop-shadows, and elegant light/dark theme variables.
- **🏷️ Multi-Layer Classification**: 
  - **Priority Levels**: Color-coded indicators and glowing rings for High, Medium, and Low priorities.
  - **Category Tags**: Organize tasks under Work, Personal, Studies, or Other classification banners.
- **🔔 Web Audio API Synthesizer Alarms**: Play programmatically synthesized tones directly in the browser. Zero external media file dependencies.
  - **Alarm Tones**: Choose from *Retro Digital Beeps*, *Harmonic Arpeggio Chimes*, or *Deep Warning Pulses*.
  - **Volume Adjustments**: Slide volume from 0% mute up to 100% "Loud Volume".
- **⏰ Active Ringing & Snooze Engine**: Pulsing alert banners with Snooze (reschedules alarm by +5 minutes) and Dismiss buttons.
- **📅 Missed Alarms Tracker**: If the browser tab or app was closed during a scheduled alarm, a recovery banner lists missed tasks when the application reopens.
- **📊 Interactive Dashboard**: Real-time circular progress indicator highlighting task completion metrics.
- **💾 Local Persistence**: Automatically serializes tasks, states, categories, and settings using local storage so the application "remembers everything."
- **🤖 Native Android Support**: Seamless mobile app packaging using the Ionic Capacitor container.
- **🚀 Continuous Deployment**: Automatically pushes built static assets to GitHub Pages using automated CI/CD workflows.

---

## 🛠️ Languages & Tech Stack

This project is built using a cross-platform, single-page application architecture:

### 🔤 Languages Used
- **TypeScript (JS)**: Powers the state management, local database sync, event handling, and synthesized audio scheduling.
- **HTML5**: Structured semantic layout with custom inline vector icons (SVGs).
- **CSS3 (Vanilla)**: Handles the layouts, custom scrollbars, animations, media queries, and themes.
- **Java**: Used in the native Android application wrapper (`MainActivity.java`).
- **XML**: Configures the native Android app manifest, icon assets, and layouts.
- **Groovy**: Configures Gradle compilation scripts (`build.gradle`, `variables.gradle`).

### 📦 Tools & Frameworks
- **Vite**: Frontend build utility.
- **Capacitor**: Bridges the web code to native Android APIs and Android Studio wrappers.
- **Gradle**: Native Android compiler.
- **OpenJDK 17**: Builds the Android Java sources.

---

## 🚀 Setup & Run Instructions

### 🌐 Running the Web Application

Ensure you have [Node.js](https://nodejs.org/) installed, then execute:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:5173](http://localhost:5173)** in your browser.

3. **Build Production Assets**:
   ```bash
   npm run build
   ```

---

### 📱 Compiling the Android App (APK)

With [OpenJDK 17](https://learn.microsoft.com/en-us/java/openjdk/download) and the [Android SDK](https://developer.android.com/studio) installed:

1. **Synchronize Web Assets**:
   ```bash
   npx cap sync
   ```

2. **Compile native debug APK**:
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```
   The compiled APK file is generated at `android/app/build/outputs/apk/debug/app-debug.apk` and copied to the root as `ZenithTask.apk`.

---

### 🌩️ Cloud Deployment (GitHub Pages)

A GitHub Actions workflow (`deploy.yml`) is included. Every push to the `main` branch automatically builds and deploys your website. 

To activate the page:
1. Go to your repository settings page: `Settings` -> `Pages`.
2. Under **Build and deployment** -> **Source**, select `Deploy from a branch`.
3. Set the branch selection to **`gh-pages`** and folder to `/ (root)`, then click **Save**.
4. The live site will be hosted at `https://nikhilrana2715.github.io/Zenith-TO-DO-List/`.

---

## 🤖 Developed by Antigravity (AI)

This project was built through a pair-programming collaboration between the user **Nikhil** and **Antigravity**.

### About Antigravity
**Antigravity** is a powerful agentic AI coding assistant designed by the **Google DeepMind** team working on **Advanced Agentic Coding**. 

Designed to operate with a high level of autonomy, Antigravity excels at:
- Setting up compiler environments and tooling (such as Vite, TypeScript, and Capacitor).
- Programmatically synthesizing native hardware APIs (like browser Web Audio context nodes).
- Writing responsive CSS layouts, modern animations, and semantic page structures.
- Integrating database stores and persistence layers.
- Diagnosing and patching complex multi-platform errors (such as Java version compatibility issues during Gradle compilation).

---

## 👨‍💻 Creator & Author
- **Nikhil Rana** ([@nikhilrana2715](https://github.com/nikhilrana2715))

---

## 📄 License & Copyright
© 2026 Nikhil Rana. All rights reserved. 
Licensed under the [MIT License](https://opensource.org/licenses/MIT).
