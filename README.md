# Lyra Ekonomi Botu

Lyra, TypeScript ile geliştirilmiş, modern ve güçlü bir Discord botudur. MongoDB veritabanı entegrasyonu ile gelişmiş komut yapısına sahiptir.

## 🚀 Özellikler

- TypeScript ile geliştirilmiş güvenli kod yapısı
- MongoDB veritabanı entegrasyonu
- Slash komut desteği
- Gelişmiş hata yönetimi
- Modern Discord.js v14 altyapısı

## 📋 Gereksinimler

- Node.js (v16.9.0 veya üstü)
- MongoDB veritabanı
- Discord Bot Token
- npm veya yarn

## ⚙️ Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/erlly/lyra-ekonomi-botu.git
cd Lyra
```

2. Gerekli paketleri yükleyin:
```bash
npm install
# veya
yarn install
```

3. `.env` dosyasını oluşturun ve gerekli bilgileri ekleyin:
```env
TOKEN=discord_bot_token_buraya
MONGODB_URI=mongodb_baglanti_url_buraya
ADMIN_IDS=kendi id'niz
```

4. Botu başlatın:
```bash
# Geliştirme modu için
npm run dev
# veya
yarn dev

# Production modu için
npm run start
# veya
yarn start
```

## 🛠️ Komutlar

### Admin Komutları
- `/admin_urun_ekle` - Markete ürün eklersiniz
- `/admin_urun_sil` - Marketten ürün silersiniz
- `/admin_para_ver` - Belirttiğiniz kullanıcıya girdiğiniz değer kadar para eklersiniz
- `/admin_para_al` - Belirttiğiniz kullanıdan girdiğiniz değer kadar para alırsınız

### Genel Komutlar
- `/yardım` - Komut listesini gösterir

## 🔧 Geliştirme

1. TypeScript dosyalarını derlemek için:
```bash
npm run build
# veya
yarn build
```

2. Linting için:
```bash
npm run lint
# veya
yarn lint
```

## 📝 Notlar

- Bot, Discord.js v14 kullanmaktadır
- Tüm komutlar slash komut olarak tasarlanmıştır
- Hata durumlarında detaylı loglama yapılmaktadır

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: XYZ'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun


## 👨‍💻 Geliştirici

Developed By Erslly

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 
