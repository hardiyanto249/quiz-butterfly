package models

import (
	"time"

	"github.com/lib/pq"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// HighScore represents a user's high score for a difficulty level
type HighScore struct {
	ID         int       `json:"id" db:"id"`
	UserID     int       `json:"user_id" db:"user_id"`
	Difficulty string    `json:"difficulty" db:"difficulty"`
	Score      int       `json:"score" db:"score"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

// Question represents a quiz question
type Question struct {
	ID                 int            `json:"id" db:"id"`
	QuestionText       string         `json:"question_text" db:"question_text"`
	Options            pq.StringArray `json:"options" db:"options"`
	CorrectAnswerIndex int            `json:"correct_answer_index" db:"correct_answer_index"`
	Reference          string         `json:"reference" db:"reference"`
	Difficulty         string         `json:"difficulty" db:"difficulty"`
	CreatedAt          time.Time      `json:"created_at" db:"created_at"`
}

// QuizSession represents a quiz session
type QuizSession struct {
	ID                   int        `json:"id" db:"id"`
	UserID               int        `json:"user_id" db:"user_id"`
	Difficulty           string     `json:"difficulty" db:"difficulty"`
	CurrentQuestionIndex int        `json:"current_question_index" db:"current_question_index"`
	Score                int        `json:"score" db:"score"`
	Status               string     `json:"status" db:"status"`
	StartedAt            time.Time  `json:"started_at" db:"started_at"`
	FinishedAt           *time.Time `json:"finished_at,omitempty" db:"finished_at"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
}

// UserAnswer represents an answer given by a user in a quiz session
type UserAnswer struct {
	ID            int       `json:"id" db:"id"`
	QuizSessionID int       `json:"quiz_session_id" db:"quiz_session_id"`
	QuestionID    int       `json:"question_id" db:"question_id"`
	QuestionText  string    `json:"question_text" db:"question_text"`
	UserAnswer    string    `json:"user_answer" db:"user_answer"`
	CorrectAnswer string    `json:"correct_answer" db:"correct_answer"`
	IsCorrect     bool      `json:"is_correct" db:"is_correct"`
	Reference     string    `json:"reference" db:"reference"`
	AnsweredAt    time.Time `json:"answered_at" db:"answered_at"`
}

// API request/response types

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest represents a user login request
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

// QuizStartRequest represents a request to start a quiz
type QuizStartRequest struct {
	Difficulty string `json:"difficulty" binding:"required,oneof=easy medium advance"`
}

// QuizAnswerRequest represents a request to submit an answer
type QuizAnswerRequest struct {
	QuestionID int    `json:"question_id" binding:"required"`
	Answer     string `json:"answer" binding:"required"`
}

// QuizProgress represents the current quiz progress
type QuizProgress struct {
	SessionID            int          `json:"session_id"`
	CurrentQuestionIndex int          `json:"current_question_index"`
	Score                int          `json:"score"`
	Status               string       `json:"status"`
	CurrentQuestion      *Question    `json:"current_question,omitempty"`
	UserAnswers          []UserAnswer `json:"user_answers,omitempty"`
}

// UserProfile represents user profile information
type UserProfile struct {
	User       User        `json:"user"`
	HighScores []HighScore `json:"high_scores"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}
