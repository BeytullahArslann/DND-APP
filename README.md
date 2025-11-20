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

## Üretim
```
npm run build
npm run preview
```

## GitHub Pages ile Ücretsiz Barındırma
GitHub Actions, projeyi otomatik olarak derleyip GitHub Pages üzerinde yayınlamak için yapılandırıldı.

1. Depodaki **Settings → Pages** bölümünden kaynak olarak `GitHub Actions` seçin.
2. Varsayılan `main` branch'ine push ettiğinizde `.github/workflows/deploy.yml` çalışır ve `dist` çıktısını Pages'a gönderir.
3. Proje repo adı değişirse, Vite otomatik olarak GitHub Pages yolu (`/REPO_ADI/`) ile derlenir; gerekirse `BASE_PATH` ortam değişkeni ile özel yol belirtebilirsiniz.
4. `public/404.html` dosyası, Pages üzerinde sayfa yenilendiğinde veya derin link açıldığında uygulamaya otomatik yönlendirme sağlar.
5. `BASE_PATH` değeri başında/sonunda `/` olmayan bir dizgi olsa bile otomatik olarak normalize edilir; ekstra eğik çizgi eklemenize gerek yoktur.
6. İsteğe bağlı olarak workflow'u manuel tetiklemek için **Actions** sekmesinden `Build and Deploy` iş akışını `Run workflow` ile çalıştırabilirsiniz.
7. İlk dağıtımda 404 hatası almamak için Pages'in etkin olduğundan emin olun; gerekirse **Settings → Pages** ekranında `GitHub Actions` kaynağını yeniden kaydedip iş akışını tekrar çalıştırın.

## Ekstra Özellikler
- Oda kodu, URL üzerinden otomatik doldurulur (ör. `?room=masa1`).
- Paylaşım butonu ile oda linkini tek tıkla panoya kopyalayabilirsiniz.
- Firebase yapılandırması bulunamazsa varsayılan demo kimliği kullanılır ve başlıkta uyarı rozeti gösterilir.
