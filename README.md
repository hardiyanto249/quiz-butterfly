# Quiz Butterfly - Full Stack Application

Aplikasi kuis interaktif dengan tema Butterfly Hug berdasarkan penelitian tentang teknik relaksasi untuk mengurangi kecemasan pada remaja.

## 🚀 Quick Start

### Opsi 1: Jalankan dengan Script Otomatis (Windows)

```bash
# Double-click file run.bat atau jalankan di command prompt
run.bat
```

### Opsi 2: Jalankan dengan Script Otomatis (Linux/Mac)

```bash
# Beri permission execute ke script
chmod +x start.sh

# Jalankan script
./start.sh
```

### Opsi 3: Jalankan Manual

#### Step 1: Setup Database

```bash
# Buat database PostgreSQL
createdb quiz_butterfly_db

# Atau dengan psql
psql -U postgres -c "CREATE DATABASE quiz_butterfly_db;"

# Jalankan migration
psql -U postgres -d quiz_butterfly_db -f schema.sql
psql -U postgres -d quiz_butterfly_db -f seed.sql
```

#### Step 2: Jalankan Backend (Terminal 1)

```bash
cd backend
go run .
```

#### Step 3: Jalankan Frontend (Terminal 2)

```bash
npm run dev
```

## 📋 Prerequisites

- **Go 1.21+** - untuk backend
- **Node.js 16+** - untuk frontend
- **PostgreSQL 12+** - untuk database
- **Git** - untuk clone repository

## 🏗️ Arsitektur

### Backend (Go + Gin)
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Port**: 8080

### Frontend (React + TypeScript)
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Build Tool**: Vite
- **Port**: 5173

### Database Schema
- `users` - Data pengguna
- `high_scores` - Skor tertinggi per tingkat kesulitan
- `questions` - Pertanyaan kuis (80 pertanyaan)
- `quiz_sessions` - Sesi kuis aktif
- `user_answers` - Jawaban pengguna

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Registrasi
- `POST /auth/login` - Login

### User Management
- `GET /api/profile` - Profil pengguna

### Quiz
- `GET /api/questions/{difficulty}` - Ambil pertanyaan
- `POST /api/quiz/start` - Mulai kuis
- `POST /api/quiz/answer` - Submit jawaban
- `GET /api/quiz/progress` - Progress kuis
- `POST /api/quiz/finish` - Selesai kuis

## 🎮 Fitur Aplikasi

- ✅ **Autentikasi**: Register & Login dengan JWT
- ✅ **Tiga Tingkat Kesulitan**: Easy, Medium, Advance
- ✅ **80 Pertanyaan**: Berdasarkan penelitian Butterfly Hug
- ✅ **Real-time Scoring**: Hitung skor otomatis
- ✅ **High Score Tracking**: Simpan skor terbaik
- ✅ **Progress Saving**: Lanjutkan kuis kapan saja
- ✅ **Responsive Design**: Kompatibel mobile & desktop
- ✅ **Leaderboard**: Lihat skor pengguna lain

## 🔧 Development Setup

### Environment Variables

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL=postgres://postgres:password@localhost/quiz_butterfly_db?sslmode=disable
JWT_SECRET=your-secret-key-change-in-production
GIN_MODE=debug
PORT=8080
```

### Build untuk Production

#### Backend
```bash
cd backend
go build -o quiz-backend .
```

#### Frontend
```bash
npm run build
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Periksa apakah PostgreSQL running
sudo systemctl status postgresql

# Test koneksi
psql -U postgres -d quiz_butterfly_db -c "SELECT COUNT(*) FROM questions;"
```

### Port Already in Use
```bash
# Ubah port backend
cd backend
PORT=3000 go run .

# Ubah port frontend
npm run dev -- --port 3001
```

### Dependencies Issues
```bash
# Backend
cd backend && go mod tidy

# Frontend
npm install
```

## 📊 Database Operations

### Reset Database
```bash
psql -U postgres -c "DROP DATABASE quiz_butterfly_db;"
psql -U postgres -c "CREATE DATABASE quiz_butterfly_db;"
psql -U postgres -d quiz_butterfly_db -f schema.sql
psql -U postgres -d quiz_butterfly_db -f seed.sql
```

### Check Data
```bash
psql -U postgres -d quiz_butterfly_db -c "SELECT difficulty, COUNT(*) FROM questions GROUP BY difficulty;"
```

## 🎯 Tech Stack

- **Backend**: Go, Gin, PostgreSQL, JWT
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Database**: PostgreSQL dengan pgx driver
- **Authentication**: JWT dengan bcrypt hashing

## 📝 License

This project is for educational purposes.

---

**Happy Learning! 🦋**
