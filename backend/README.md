# Quiz Butterfly Backend

Go backend API untuk aplikasi Quiz Butterfly dengan PostgreSQL database.

## Prerequisites

- Go 1.21+
- PostgreSQL 12+
- Git

## Setup dan Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd quiz-butterfly/backend
```

### 2. Setup Database

Pastikan PostgreSQL sudah berjalan dan buat database:

```bash
# Login ke PostgreSQL sebagai postgres user
psql -U postgres

# Buat database
CREATE DATABASE quiz_butterfly_db;

# Keluar dari psql
\q
```

### 3. Jalankan Migration dan Seed Database

```bash
# Jalankan schema
psql -U postgres -d quiz_butterfly_db -f ../schema.sql

# Jalankan seed data
psql -U postgres -d quiz_butterfly_db -f ../seed.sql
```

### 4. Setup Environment Variables (Opsional)

Buat file `.env` di folder backend:

```env
DATABASE_URL=postgres://postgres:password@localhost/quiz_butterfly_db?sslmode=disable
JWT_SECRET=your-secret-key-change-in-production
GIN_MODE=release
PORT=8080
```

### 5. Install Dependencies dan Jalankan

```bash
# Download dependencies
go mod tidy

# Jalankan server
go run .
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

### Protected Routes (Require Authorization Header: Bearer <token>)

#### Get User Profile
```http
GET /api/profile
Authorization: Bearer <jwt-token>
```

#### Get Questions by Difficulty
```http
GET /api/questions/easy
GET /api/questions/medium
GET /api/questions/advance
Authorization: Bearer <jwt-token>
```

#### Start Quiz
```http
POST /api/quiz/start
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "difficulty": "easy"
}
```

#### Submit Answer
```http
POST /api/quiz/answer
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "question_id": 1,
  "answer": "Selected answer"
}
```

#### Get Quiz Progress
```http
GET /api/quiz/progress
Authorization: Bearer <jwt-token>
```

#### Finish Quiz
```http
POST /api/quiz/finish
Authorization: Bearer <jwt-token>
```

## Database Schema

### Tables

- `users` - User accounts
- `high_scores` - User high scores per difficulty
- `questions` - Quiz questions
- `quiz_sessions` - Quiz session tracking
- `user_answers` - User answers in quiz sessions

## Development

### Menjalankan Tests

```bash
go test ./...
```

### Build untuk Production

```bash
go build -o quiz-backend .
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key untuk JWT tokens
- `GIN_MODE` - Gin mode (debug/release)
- `PORT` - Port server (default: 8080)

## Troubleshooting

### Database Connection Issues

1. Pastikan PostgreSQL service sedang berjalan
2. Periksa connection string di `DATABASE_URL`
3. Pastikan user postgres memiliki akses ke database

### Port Already in Use

Ubah port dengan environment variable:
```bash
PORT=3000 go run .
```

### Dependencies Issues

```bash
go mod tidy
go mod download