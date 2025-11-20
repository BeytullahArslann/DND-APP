# Zindan Ustası

Bu proje, Firebase destekli gerçek zamanlı zar atma ve karakter yönetimi özellikleriyle masaüstü rol yapma seanslarınızı yönetmek için hazırlanmış bir React uygulamasıdır.

## Başlarken

1. Bağımlılıkları kurun:
   ```bash
   npm install
   ```
2. `.env` dosyasını oluşturun:
   ```bash
   cp .env.example .env
   ```
   `VITE_FIREBASE_CONFIG` değerine kendi Firebase yapılandırmanızı JSON string olarak ekleyin.
3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Ortam değişkenleri
- `VITE_FIREBASE_CONFIG`: Firebase yapılandırması (JSON string).
- `VITE_APP_ID`: Firestore içindeki kayıtların gruplanacağı benzersiz kimlik.
- `VITE_INITIAL_AUTH_TOKEN`: (Opsiyonel) Sunucu tarafından sağlanan özel giriş token'ı.

### VITE_INITIAL_AUTH_TOKEN nasıl alınır?
- Bu değer, Firebase **Admin SDK** ile üretilen bir **custom token** olmalıdır. İstemci bu token'ı alır almaz `signInWithCustomToken` ile oturum açar; boş bırakılırsa anonim giriş kullanılır.
- Bir kezlik oturum açma token'ı üretmek için sunucu tarafında örnek Node.js kodu:
  ```js
  import { initializeApp, applicationDefault } from 'firebase-admin/app';
  import { getAuth } from 'firebase-admin/auth';

  initializeApp({ credential: applicationDefault() });
  const customToken = await getAuth().createCustomToken('kullanici-id');
  console.log(customToken); // Çıktıyı VITE_INITIAL_AUTH_TOKEN olarak kullanın
  ```
- İsteğe bağlı olarak Cloud Functions ya da kendi backend'inizde bu token'ı üretip, Pages build'i sırasında `VITE_INITIAL_AUTH_TOKEN` olarak gizli değişkene set edebilirsiniz.

## Üretim
```
npm run build
npm run preview
```

## GitHub Pages ile Ücretsiz Barındırma
GitHub Actions, projeyi otomatik olarak derleyip GitHub Pages üzerinde yayınlamak için yapılandırıldı.

1. Depodaki **Settings → Pages** bölümünden kaynak olarak `GitHub Actions` seçin.
2. Varsayılan `main` branch'ine push ettiğinizde `.github/workflows/deploy.yml` çalışır ve `dist` çıktısını Pages'a gönderir.
3. Proje repo adı değişirse, GitHub Actions derleme adımındaki `BASE_PATH` ortam değişkeni otomatik olarak güncellenerek Vite için doğru alt yol kullanılır.
4. İsteğe bağlı olarak workflow'u manuel tetiklemek için **Actions** sekmesinden `Build and Deploy` iş akışını `Run workflow` ile çalıştırabilirsiniz.

## Ekstra Özellikler
- Oda kodu, URL üzerinden otomatik doldurulur (ör. `?room=masa1`).
- Paylaşım butonu ile oda linkini tek tıkla panoya kopyalayabilirsiniz.
- Firebase yapılandırması bulunamazsa varsayılan demo kimliği kullanılır ve başlıkta uyarı rozeti gösterilir.
