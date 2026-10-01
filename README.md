# SuperDash — Personal Productivity OS ⚡

A modern, fluid, modular web operating system and personal productivity suite designed for desktop, tablet, and native Android.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Capacitor 8**, and **Lucide Icons**.

---

## ✨ What is SuperDash?

SuperDash combines the fluidity of a desktop operating system (with multi-window management, docking, and universal search) with a mobile-first native experience on Android and touch devices.

- **22 Built-in Applications**: Calculator, Notes, Calendar, Weather, Tasks, Timer, Converter, Settings, Reminders, Files, World Clock, Hearings, Finance, Ideas, Focus, Decision Book, Morning, Reader, Live, Collections, Dashboard Builder, and Updates.
- **True Mobile Responsiveness**: Intentionally designed for mobile screens with touch-friendly bottom sheets, fluid layouts, safe-area insets, list-to-detail navigation, and overlay drawers.
- **Universal Spotlight Search (`⌘K` / `Ctrl+K`)**: Rapid indexed searching across applications, notes, tasks, calendar events, and inline math evaluation.
- **Liquid Glass Design System**: Frosted glassmorphism (`backdrop-blur-md`), ambient lighting, specular reflections, dynamic themes (Dark/Light/System), and customizable wallpaper auras.
- **Zero Cloud Lock-in**: Offline-first storage persistence with zero external tracking. Your data stays entirely in your browser or local device storage.
- **Automated GitHub Deployment & Updates**: Automated GitHub Pages static hosting, Android APK build workflow, and an in-app **Updates Center** to track changes without data loss.

---

## 📱 Mobile & Android Experience

SuperDash 1.5 introduces an architectural mobile redesign:
- **Liquid Glass Bottom Sheets**: Modals and creation dialogs (Calculator history, Currency pickers, Calendar event creation, Timer presets) slide from the bottom on phones.
- **List-to-Detail Navigation**: Apps like Notes switch to a full-screen editor with a back button instead of squishing desktop multi-column panels.
- **Overflow & Safe Area Protection**: Respects device notches, navigation bars, and status bars using standard CSS `env(safe-area-inset-*)`.
- **Touch-Visible Controls**: Delete, edit, and action controls remain directly accessible on touch screens without requiring hover states.
- **Overlay Drawers**: Complex applications like Dashboard Builder slide their Widget Library and Inspector panels over the canvas as sheets with backdrop dismiss.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+
- Optional for Android development: **Android Studio**, **JDK 17**, and **Android SDK Platform 34+**

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/elamranioth/SuperDash.git
cd SuperDash

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

---

## 🌐 Deploying to GitHub Pages

SuperDash is pre-configured with a complete automated GitHub Pages workflow:

1. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/elamranioth/SuperDash.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.

3. **Automatic Deployment**:
   - Every push to `main` automatically triggers `.github/workflows/deploy.yml`.
   - The workflow runs `npm run build` with relative base assets and publishes directly to `https://elamranioth.github.io/SuperDash/`.

---

## 🤖 Building the Android APK

SuperDash uses **Capacitor 8** to run natively on Android.

### Local APK Build
```bash
# 1. Build web production bundle
npm run build

# 2. Sync web assets with native Android project
npx cap sync android

# 3. Build Debug APK using Gradle wrapper (Windows)
cmd /c "android\gradlew.bat -p android assembleDebug"

# On macOS / Linux:
# ./android/gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Automated APK Builds in GitHub Actions
Pushing a git tag (e.g. `git tag v1.5.0 && git push origin v1.5.0`) triggers `.github/workflows/build-apk.yml`, which:
1. Builds the web bundle and syncs Capacitor.
2. Compiles `SuperDash.apk` on Ubuntu using Android SDK.
3. Automatically attaches `SuperDash.apk` as a downloadable asset in the GitHub Release!

---

## 🔄 Updates & Versioning System

SuperDash includes an integrated **Updates** application (in the Utilities category):
- **Live Update Checker**: Queries `./updates/latest.json` for new releases.
- **Per-App Changelogs**: Lists what changed across all 21 apps tagged with `NEW`, `IMPROVED`, or `FIXED`.
- **Release History**: View previous version milestones and changelogs.
- **NEW Badge**: Displays a subtle pulse badge on updated apps in the launcher until viewed.
- **Service Worker Refresh**: Triggers immediate background updates for PWA and Web users.

### How Updates Work (Web vs APK):
- **Web & PWA**: Static assets use content-hashed filenames. Updating the site refreshes assets immediately while preserving your local browser storage.
- **Android APK**: Installing a newer APK updates binary code while retaining the WebView's persistent SQLite/localStorage database intact.

---

## 📦 Releasing SuperDash (Step-by-Step)

Follow these steps to produce a verified, reliable release:

1. **Update Version Numbers**:
   - `src/version.ts`: update `SUPERDASH_VERSION = '1.x.y'` and `SUPERDASH_BUILD_DATE`.
   - `package.json`: update `"version": "1.x.y"`.
   - `android/app/build.gradle`: increment `versionCode` (integer) and update `versionName "1.x.y"`.

2. **Update Release Manifests**:
   - `public/updates/latest.json`: update `version`, `releaseDate`, `title`, `summary`, `highlights`, and `changes`.
   - `public/updates/history.json`: prepend the new release entry to the array.

3. **Run Verification & Build**:
   ```bash
   npm run build
   npx cap sync android
   cmd /c "android\gradlew.bat -p android assembleDebug"
   copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "public\SuperDash.apk"
   ```

4. **Commit & Tag**:
   ```bash
   git add -A
   git commit -m "release: v1.x.y"
   git tag v1.x.y
   ```

5. **Push to GitHub**:
   ```bash
   git push origin main
   git push origin v1.x.y
   ```

6. **Automated Verification**:
   - GitHub Actions automatically builds the Android APK, creates the GitHub Release with attached `SuperDash.apk`, and deploys the web client to GitHub Pages.
   - Open SuperDash → **Settings** → **Updates** and confirm the new release is detected and installs cleanly.

---

## 💾 Backup & MEGA Sync Strategy

SuperDash supports independent cloud backup through desktop folder synchronization:
1. Open **Settings** → **Data & Backup**.
2. Tap **Choose MEGA Folder** and pick your synchronized `MEGA/SuperDash Backups` directory.
3. SuperDash writes standardized `.superdash` backup packages with manifests and record counts.
4. The desktop MEGA client automatically syncs backup files to the cloud with zero password or credential exposure in SuperDash.
5. Before any restore, a safety snapshot is preserved so you can always roll back safely.

---

## 🛡️ Zero Data Loss Guarantee

All user data (notes, financial transactions, tasks, reminders, documents, collections, settings, and custom dashboard layouts) is stored locally on your device using `StorageService`.

- **No Remote Wipe**: Software updates never touch or reset existing user data keys.
- **Full Portability**: Built-in JSON export and import in **Settings** → **Data & Backup** lets you back up your entire system anytime.

---

## 📄 License
MIT © SuperDash
