# Teknik Dökümantasyon

Bu döküman, projenin teknik detaylarını, mimari kararlarını, kullanılan teknolojileri ve geliştirme süreçlerini kapsamlı bir şekilde ele alır. Geliştirici ekibine rehberlik etmesi amacıyla hazırlanmıştır.

## 1. Giriş

Bu proje, **React** tabanlı, çok platformlu (Web, Desktop, Mobile) bir uygulamadır. Kullanıcıların odalar oluşturup yönetebildiği, gerçek zamanlı etkileşimlerde (sohbet, zar atma vb.) bulunabildiği bir sistem sunar. Veri saklama ve kimlik doğrulama işlemleri için **Firebase** altyapısını kullanır.

## 2. Teknoloji Yığını

Proje modern web teknolojileri üzerine inşa edilmiştir:

*   **Dil:** TypeScript
*   **Frontend Framework:** React 18
*   **Build Tool:** Vite
*   **Stil:** Tailwind CSS
*   **State Management:** React Context API
*   **Backend / BaaS:** Firebase (Authentication, Firestore, Storage)
*   **Test:** Vitest, React Testing Library
*   **Mobil:** Capacitor (Android & iOS)
*   **Masaüstü:** Electron

### Versiyonlar
*   Node.js: LTS sürümü önerilir.
*   React: ^18.3.1
*   Electron: ^33.2.0
*   Capacitor: ^7.4.4

## 3. Proje Yapısı

Proje dizin yapısı aşağıdaki gibidir:

```
/
├── android/            # Capacitor Android projesi
├── electron/           # Electron ana işlem (main process) kodları
├── ios/                # Capacitor iOS projesi
├── src/                # Uygulama kaynak kodları
│   ├── components/     # UI bileşenleri (atomik ve yeniden kullanılabilir)
│   ├── constants/      # Sabit değerler
│   ├── context/        # Global state yönetimi (Auth, Toast vb.)
│   ├── hooks/          # Özel React hook'ları (useRoom vb.)
│   ├── layouts/        # Sayfa düzenleri (MainLayout vb.)
│   ├── lib/            # Kütüphane konfigürasyonları (firebase.ts vb.)
│   ├── pages/          # Uygulama sayfaları (Route hedefleri)
│   ├── services/       # İş mantığı ve veri erişim katmanı
│   ├── types/          # TypeScript tip tanımları
│   └── utils/          # Yardımcı fonksiyonlar
├── verification/       # Doğrulama scriptleri
├── capacitor.config.ts # Capacitor ayarları
├── vite.config.ts      # Vite konfigürasyonu
└── package.json        # Bağımlılıklar ve scriptler
```

## 4. Mimari ve Tasarım Desenleri

Proje, bakımı kolaylaştırmak ve kod tekrarını önlemek için belirli desenleri takip eder.

### 4.1. Servis Katmanı (Service Layer) Pattern
Veritabanı işlemleri ve karmaşık iş mantıkları UI bileşenlerinden ayrılmıştır. `src/services/` altında yer alan dosyalar, doğrudan Firestore ile iletişim kurar.

*   **Örnek:** `roomService.ts`, `userService.ts`
*   **Amaç:** UI bileşenlerinin verinin nereden geldiğini bilmemesi, sadece veriyi kullanmasıdır. Test edilebilirlik artar.

### 4.2. Context API & Provider Pattern
Global durum yönetimi için React Context API kullanılır.
*   **AuthContext:** Kullanıcının oturum durumu (`user`, `loading`, `error`) yönetilir.
*   **ToastContext:** Uygulama genelinde bildirim (toast) göstermek için kullanılır.

### 4.3. Custom Hooks
Tekrarlanan mantıklar (logic) özel hook'lar içine alınır.
*   **useRoom:** Bir odaya ait verileri ve işlemleri kapsüller.

## 5. Veri Modeli ve Veritabanı

Veritabanı olarak **Firestore** (NoSQL) kullanılır. Veriler `artifacts` koleksiyonu altında izole edilmiştir. Bu yapı, `appId` (uygulama kimliği) bazlı çoklu kiracı (multi-tenancy) veya ortam izolasyonu sağlar.

### Şema Yapısı

```
artifacts/
  └── {appId}/           # Ortam veya uygulama ID'si (örn: "default", "prod")
      ├── users/         # Kullanıcı profilleri
      │   └── {uid}      # Belge: { displayName, photoURL, ... }
      ├── rooms/         # Oyun odaları
      │   └── {roomId}   # Belge: { name, ownerId, members, ... }
      └── public/        # Herkese açık paylaşılan veriler
```

### Önemli Veritabanı Kuralları
*   Uygulama `VITE_APP_ID` ortam değişkenini kullanarak hangi alt ağaçta (`artifacts/{appId}`) çalışacağını belirler.
*   Güvenlik kuralları (Firestore Rules), genellikle sadece yetkili kullanıcıların kendi verilerine veya üye oldukları odalara erişmesine izin verecek şekilde yapılandırılmalıdır.

## 6. Kurulum ve Geliştirme Süreci

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları izleyin.

### 6.1. Hazırlık
1.  Depoyu klonlayın.
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

### 6.2. Ortam Değişkenleri
Proje, Firebase konfigürasyonu için ortam değişkenlerine ihtiyaç duyar. `.env` dosyası oluşturun (veya CI/CD ortamında tanımlayın):

*   `VITE_FIREBASE_CONFIG`: Firebase yapılandırma objesinin JSON string hali.
*   `VITE_APP_ID`: Veritabanı izolasyonu için uygulama kimliği (varsayılan: `default`).

> **Not:** Eğer `VITE_FIREBASE_CONFIG` tanımlanmazsa, uygulama otomatik olarak **Demo Modu**'nda (etkisiz bir yapılandırma ile) başlar.

### 6.3. Çalıştırma
*   **Web:** `npm run dev`
*   **Electron (Dev):** `npm run electron:dev`
*   **Android:** `npm run cap:android` (Android Studio gerektirir)

## 7. Test Stratejisi

Testler geliştirme sürecinin ayrılmaz bir parçasıdır. **Vitest** kullanılır.

*   **Birim Testleri (Unit Tests):** `src/services`, `src/utils` gibi mantık içeren dosyalar test edilmelidir. Test dosyaları kaynak dosyanın yanındaki `__tests__` klasöründe bulunur.
*   **Çalıştırma:**
    ```bash
    npm run test        # Tüm testleri bir kez çalıştırır
    npm run test:ui     # UI arayüzü ile testleri izler
    ```
*   **Kural:** `npm run test` komutu hatasız tamamlanmadan kod gönderimi (push/merge) yapılmamalıdır.

## 8. Derleme ve Dağıtım (Build & Deployment)

### Web (GitHub Pages)
GitHub Actions iş akışları ile otomatik dağıtım yapılır. Build işlemi `npm run build` komutunu çalıştırır ve `dist/` klasörünü oluşturur.

### Masaüstü (Electron)
`npm run electron:build` komutu hem Vite build işlemini yapar hem de `electron-builder` kullanarak işletim sistemine uygun (exe, dmg, AppImage) dosyasını üretir.

### Mobil (Capacitor)
Web varlıkları build edildikten sonra native projelere senkronize edilir:
```bash
npm run build
npx cap sync
```
Ardından native IDE (Android Studio / Xcode) üzerinden derleme alınır.

## 9. Dikkat Edilmesi Gerekenler ve İpuçları

1.  **Mobil Güvenli Alanlar (Safe Areas):**
    *   iOS çentikli ekranlar için `env(safe-area-inset-*)` CSS değişkenleri `tailwind.config.cjs` içinde tanımlanmıştır. `pt-safe`, `pb-safe` gibi sınıfları kullanın.

2.  **Firebase Config Hataları:**
    *   Uygulama açılmıyor veya veri gelmiyorsa, konsolda `VITE_FIREBASE_CONFIG` ile ilgili uyarıları kontrol edin. JSON formatının doğru olduğundan emin olun.

3.  **Import Yolları:**
    *   Mümkünse mutlak yollar (`src/components/...` gibi) yerine göreceli yollar veya tanımlı aliaslar kullanılmalıdır (şu an proje yapısı göreceli yolları kullanmaktadır).

4.  **Types:**
    *   `any` kullanımından kaçının. `src/types/` altında tanımlı tipleri (örneğin `UserProfile`, `Room`) kullanın.

## 10. Nasıl Yapılır? (Sık Sorulan İşlemler)

### Yeni Bir Servis Eklemek
1.  `src/services/` altında yeni bir dosya oluşturun (örn: `chatService.ts`).
2.  Firestore referanslarını tanımlayın.
3.  Fonksiyonları `export` edin.
4.  Mutlaka `__tests__` klasörüne testlerini yazın.

### Yeni Bir Sayfa Eklemek
1.  `src/pages/` altında bileşeni oluşturun.
2.  `src/App.tsx` dosyasındaki `createBrowserRouter` dizisine yeni rotayı ekleyin.

### Elektron ile İlgili Değişiklik Yapmak
1.  Eğer Node.js tarafında (Main Process) kod yazacaksanız `electron/main.js` (veya ilgili dosyaları) düzenleyin.
2.  Eğer UI tarafında değişiklik yapacaksanız `src/` klasöründe çalışın; Electron sadece bir web wrapper gibi davranır.
