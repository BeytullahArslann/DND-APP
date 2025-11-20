# Cross-Platform Build Instructions
# Cross-Platform Derleme Talimatları

This project can be built for Web, iOS, Android, macOS, Windows, and Linux.
Bu proje Web, iOS, Android, macOS, Windows ve Linux için derlenebilir.

## Prerequisites / Ön Gereksinimler

- Node.js (v18+)
- NPM

## Web

Run development server / Geliştirme sunucusunu çalıştır:
```bash
npm run dev
```

Build for production / Prodüksiyon için derle:
```bash
npm run build
```

## Mobile (iOS & Android) - Capacitor

The mobile apps are built using Capacitor. You need to have the native SDKs installed (Xcode for iOS, Android Studio for Android).
Mobil uygulamalar Capacitor kullanılarak oluşturulur. Native SDK'ların kurulu olması gerekir (iOS için Xcode, Android için Android Studio).

1. **Build the web assets / Web varlıklarını derle:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor / Capacitor senkronizasyonu:**
   ```bash
   npx cap sync
   ```

3. **iOS (Mac Only):**
   ```bash
   npx cap open ios
   ```
   This will open Xcode. Build and run from there.
   Bu komut Xcode'u açacaktır. Oradan derleyip çalıştırın.

4. **Android:**
   ```bash
   npx cap open android
   ```
   This will open Android Studio. Build and run from there.
   Bu komut Android Studio'yu açacaktır. Oradan derleyip çalıştırın.

## Desktop (macOS, Windows, Linux) - Electron

The desktop apps are built using Electron.
Masaüstü uygulamaları Electron kullanılarak oluşturulur.

1. **Run in Development Mode / Geliştirme Modunda Çalıştır:**
   ```bash
   npm run electron:dev
   ```

2. **Build for Production / Prodüksiyon İçin Derle:**
   ```bash
   npm run electron:build
   ```

   The output files (installers) will be in the `dist_electron` folder.
   Çıktı dosyaları (yükleyiciler) `dist_electron` klasöründe olacaktır.

   *   **Windows:** .exe (nsis installer)
   *   **Linux:** .AppImage
   *   **macOS:** .dmg (requires building on macOS)

## Troubleshooting / Sorun Giderme

- **Safe Area Issues (Notch):** Use the `pt-safe-top` and `pb-safe-bottom` classes or check `index.html` viewport settings.
- **Navigation:** The sidebar switches to a bottom bar on screens narrower than 768px.
