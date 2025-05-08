# Simple-Bot-WhatsApp

 adalah bot WhatsApp yang dibangun menggunakan library [baileys]. Bot ini memungkinkan Anda untuk mengotomatisasi berbagai tugas di WhatsApp dan mendukung arsitektur modular melalui sistem perintah (command).

## How to Get Started

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan script ini:

### 1. Cloning Repository

Pertama, kloning repositori dan masuk ke direktori proyek:

```bash
git clone https://github.com/rizurinn/Simple-Bot-WhatsApp.git
cd Simple-Bot-WhatsApp
```

### 2. Dependency Installation

Instal semua dependensi yang dibutuhkan dengan perintah berikut:

```bash
npm install
```

### 3. Configuration

Sesuaikan konfigurasi yang ada pada `config.js`, seperti nama bot, pesan default, nomor owner bot, dan lain-lain.

## Running Bot

Setelah konfigurasi selesai, Anda dapat menjalankan bot dengan dua opsi berikut:

### 1. Run Directly

Untuk menjalankan bot secara langsung di terminal, gunakan perintah:

```bash
npm start
```

Bot akan berjalan hingga Anda menutup terminal atau menghentikannya secara manual.


## WhatsApp Authentication

Berikut metode autentikasi yang dapat digunakan untuk menghubungkan bot ke akun WhatsApp Anda:

### Using Pairing Code

- Setelah bot dijalankan, kode pairing akan ditampilkan di terminal.
- Buka aplikasi WhatsApp di ponsel, pilih menu **Perangkat Tertaut**, lalu ketuk **Tautkan Perangkat**.
- Masukkan kode pairing yang ditampilkan di terminal untuk menautkan akun WhatsApp dengan bot.


## Contribution

Kami sangat terbuka untuk kontribusi! Jika Anda menemukan bug atau memiliki ide untuk fitur baru, jangan ragu untuk membuka issue atau mengirimkan pull request.

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).
