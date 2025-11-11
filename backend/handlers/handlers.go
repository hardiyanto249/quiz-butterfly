package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"quiz-butterfly/backend/database"
	"quiz-butterfly/backend/models"
)

// ErrorResponse digunakan untuk respon error JSON
type ErrorResponse struct {
	Error string `json:"error"`
}

// GetProfileHandler returns user profile with high scores
func GetProfileHandler(c *gin.Context) {
	db := database.GetDB()
	userID := c.GetInt("user_id")

	var user models.User
	err := db.QueryRow(`
		SELECT id, username, created_at, updated_at
		FROM users WHERE id = $1`, userID).Scan(&user.ID, &user.Username, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to get user"})
		return
	}

	// Get high scores
	rows, err := db.Query(`
		SELECT difficulty, score FROM high_scores
		WHERE user_id = $1 ORDER BY difficulty`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to get high scores"})
		return
	}
	defer rows.Close()

	var highScores []models.HighScore
	for rows.Next() {
		var hs models.HighScore
		if err := rows.Scan(&hs.Difficulty, &hs.Score); err != nil {
			continue
		}
		hs.UserID = userID
		highScores = append(highScores, hs)
	}

	c.JSON(http.StatusOK, models.UserProfile{User: user, HighScores: highScores})
}

func GetQuestionsHandler(c *gin.Context) {
	db := database.GetDB()
	difficulty := c.Param("difficulty")

	if difficulty != "easy" && difficulty != "medium" && difficulty != "advance" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid difficulty level"})
		return
	}

	rows, err := db.Query(`
		SELECT id, question_text, options, correct_answer_index, reference, difficulty, created_at
		FROM questions WHERE difficulty = $1 ORDER BY id`, difficulty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to get questions"})
		return
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var q models.Question
		if err := rows.Scan(&q.ID, &q.QuestionText, &q.Options, &q.CorrectAnswerIndex, &q.Reference, &q.Difficulty, &q.CreatedAt); err != nil {
			continue
		}
		questions = append(questions, q)
	}

	c.JSON(http.StatusOK, questions)
}

func StartQuizHandler(c *gin.Context) {
	db := database.GetDB()
	userID := c.GetInt("user_id")

	var req models.QuizStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var session models.QuizSession
	err := db.QueryRow(`
		INSERT INTO quiz_sessions (user_id, difficulty, current_question_index, score, status)
		VALUES ($1, $2, 0, 0, 'playing')
		RETURNING id, user_id, difficulty, current_question_index, score, status, started_at, created_at`,
		userID, req.Difficulty).Scan(&session.ID, &session.UserID, &session.Difficulty,
		&session.CurrentQuestionIndex, &session.Score, &session.Status, &session.StartedAt, &session.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to start quiz"})
		return
	}

	var question models.Question
	err = db.QueryRow(`
		SELECT id, question_text, options, correct_answer_index, reference, difficulty, created_at
		FROM questions WHERE difficulty = $1 ORDER BY id LIMIT 1`,
		req.Difficulty).Scan(&question.ID, &question.QuestionText, &question.Options,
		&question.CorrectAnswerIndex, &question.Reference, &question.Difficulty, &question.CreatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to get first question"})
		return
	}

	progress := models.QuizProgress{
		SessionID:            session.ID,
		CurrentQuestionIndex: 0,
		Score:                0,
		Status:               "playing",
		CurrentQuestion:      &question,
	}

	c.JSON(http.StatusOK, progress)
}

func GetQuizProgressHandler(c *gin.Context) {
	db := database.GetDB()
	userID := c.GetInt("user_id")

	var session models.QuizSession
	err := db.QueryRow(`
		SELECT id, user_id, difficulty, current_question_index, score, status, started_at, finished_at, created_at
		FROM quiz_sessions WHERE user_id = $1 AND status = 'playing'
		ORDER BY created_at DESC LIMIT 1`, userID).Scan(&session.ID, &session.UserID, &session.Difficulty,
		&session.CurrentQuestionIndex, &session.Score, &session.Status, &session.StartedAt, &session.FinishedAt, &session.CreatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "No active quiz session"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to get quiz progress"})
		return
	}

	var question models.Question
	err = db.QueryRow(`
		SELECT id, question_text, options, correct_answer_index, reference, difficulty, created_at
		FROM questions WHERE difficulty = $1 ORDER BY id LIMIT 1 OFFSET $2`,
		session.Difficulty, session.CurrentQuestionIndex).Scan(&question.ID, &question.QuestionText, &question.Options,
		&question.CorrectAnswerIndex, &question.Reference, &question.Difficulty, &question.CreatedAt)

	progress := models.QuizProgress{
		SessionID:            session.ID,
		CurrentQuestionIndex: session.CurrentQuestionIndex,
		Score:                session.Score,
		Status:               session.Status,
	}

	if err == nil {
		progress.CurrentQuestion = &question
	}

	rows, err := db.Query(`
		SELECT question_text, user_answer, correct_answer, is_correct, reference, answered_at
		FROM user_answers WHERE quiz_session_id = $1 ORDER BY answered_at`, session.ID)
	if err == nil {
		defer rows.Close()
		var answers []models.UserAnswer
		for rows.Next() {
			var ans models.UserAnswer
			rows.Scan(&ans.QuestionText, &ans.UserAnswer, &ans.CorrectAnswer, &ans.IsCorrect, &ans.Reference, &ans.AnsweredAt)
			answers = append(answers, ans)
		}
		progress.UserAnswers = answers
	}

	c.JSON(http.StatusOK, progress)
}

func SubmitAnswerHandler(c *gin.Context) {
	db := database.GetDB()
	userID := c.GetInt("user_id")

	var req models.QuizAnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var session models.QuizSession
	err := db.QueryRow(`
		SELECT id, difficulty, current_question_index, score
		FROM quiz_sessions WHERE user_id = $1 AND status = 'playing'`, userID).Scan(
		&session.ID, &session.Difficulty, &session.CurrentQuestionIndex, &session.Score)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "No active quiz session"})
		return
	}

	var question models.Question
	err = db.QueryRow(`
		SELECT id, question_text, options, correct_answer_index, reference
		FROM questions WHERE id = $1`, req.QuestionID).Scan(
		&question.ID, &question.QuestionText, &question.Options, &question.CorrectAnswerIndex, &question.Reference)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid question ID"})
		return
	}

	isCorrect := req.Answer == question.Options[question.CorrectAnswerIndex]
	correctAnswer := question.Options[question.CorrectAnswerIndex]
	score := session.Score
	if isCorrect {
		score++
	}

	_, err = db.Exec(`
		INSERT INTO user_answers (quiz_session_id, question_id, question_text, user_answer, correct_answer, is_correct, reference)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		session.ID, req.QuestionID, question.QuestionText, req.Answer, correctAnswer, isCorrect, question.Reference)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to save answer"})
		return
	}

	session.CurrentQuestionIndex++
	_, err = db.Exec(`
		UPDATE quiz_sessions SET current_question_index = $1, score = $2
		WHERE id = $3`, session.CurrentQuestionIndex, score, session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to update session"})
		return
	}

	var nextQuestion models.Question
	err = db.QueryRow(`
		SELECT id, question_text, options, correct_answer_index, reference, difficulty, created_at
		FROM questions WHERE difficulty = $1 ORDER BY id LIMIT 1 OFFSET $2`,
		session.Difficulty, session.CurrentQuestionIndex).Scan(&nextQuestion.ID, &nextQuestion.QuestionText,
		&nextQuestion.Options, &nextQuestion.CorrectAnswerIndex, &nextQuestion.Reference,
		&nextQuestion.Difficulty, &nextQuestion.CreatedAt)

	progress := models.QuizProgress{
		SessionID:            session.ID,
		CurrentQuestionIndex: session.CurrentQuestionIndex,
		Score:                score,
		Status:               "playing",
	}
	if err == nil {
		progress.CurrentQuestion = &nextQuestion
	} else {
		progress.Status = "finished"
	}

	c.JSON(http.StatusOK, progress)
}

func FinishQuizHandler(c *gin.Context) {
	db := database.GetDB()
	userID := c.GetInt("user_id")

	var session models.QuizSession
	err := db.QueryRow(`
		SELECT id, difficulty, score FROM quiz_sessions
		WHERE user_id = $1 AND status = 'playing'`, userID).Scan(&session.ID, &session.Difficulty, &session.Score)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "No active quiz session"})
		return
	}

	now := time.Now()
	_, err = db.Exec(`
		UPDATE quiz_sessions SET status = 'finished', finished_at = $1
		WHERE id = $2`, now, session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to finish quiz"})
		return
	}

	_, err = db.Exec(`
		UPDATE high_scores SET score = GREATEST(score, $1), created_at = $2
		WHERE user_id = $3 AND difficulty = $4`, session.Score, now, userID, session.Difficulty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to update high score"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Quiz finished successfully",
		"final_score": session.Score,
		"difficulty":  session.Difficulty,
	})
}

// CreateQuestionHandler creates a new question (admin only)
func CreateQuestionHandler(c *gin.Context) {
	db := database.GetDB()

	var req models.Question
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Validate difficulty
	if req.Difficulty != "easy" && req.Difficulty != "medium" && req.Difficulty != "advance" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid difficulty level"})
		return
	}

	// Validate options array length
	if len(req.Options) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Options cannot be empty"})
		return
	}

	// Validate correct answer index
	if req.CorrectAnswerIndex < 0 || req.CorrectAnswerIndex >= len(req.Options) {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid correct answer index"})
		return
	}

	err := db.QueryRow(`
		INSERT INTO questions (question_text, options, correct_answer_index, reference, difficulty, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at`,
		req.QuestionText, req.Options, req.CorrectAnswerIndex, req.Reference, req.Difficulty, time.Now()).Scan(&req.ID, &req.CreatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to create question"})
		return
	}

	c.JSON(http.StatusCreated, req)
}

// UpdateQuestionHandler updates an existing question (admin only)
func UpdateQuestionHandler(c *gin.Context) {
	db := database.GetDB()
	questionIDStr := c.Param("id")
	questionID := 0

	if _, err := fmt.Sscanf(questionIDStr, "%d", &questionID); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid question ID"})
		return
	}

	var req models.Question
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Validate difficulty if provided
	if req.Difficulty != "" && req.Difficulty != "easy" && req.Difficulty != "medium" && req.Difficulty != "advance" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid difficulty level"})
		return
	}

	// Validate options array length if provided
	if req.Options != nil && len(req.Options) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Options cannot be empty"})
		return
	}

	// Validate correct answer index if options are provided
	if req.Options != nil && (req.CorrectAnswerIndex < 0 || req.CorrectAnswerIndex >= len(req.Options)) {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid correct answer index"})
		return
	}

	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{}
	argCount := 1

	if req.QuestionText != "" {
		setParts = append(setParts, fmt.Sprintf("question_text = $%d", argCount))
		args = append(args, req.QuestionText)
		argCount++
	}

	if req.Options != nil {
		setParts = append(setParts, fmt.Sprintf("options = $%d", argCount))
		args = append(args, req.Options)
		argCount++
	}

	if req.CorrectAnswerIndex >= 0 {
		setParts = append(setParts, fmt.Sprintf("correct_answer_index = $%d", argCount))
		args = append(args, req.CorrectAnswerIndex)
		argCount++
	}

	if req.Reference != "" {
		setParts = append(setParts, fmt.Sprintf("reference = $%d", argCount))
		args = append(args, req.Reference)
		argCount++
	}

	if req.Difficulty != "" {
		setParts = append(setParts, fmt.Sprintf("difficulty = $%d", argCount))
		args = append(args, req.Difficulty)
		argCount++
	}

	if len(setParts) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "No fields to update"})
		return
	}

	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argCount))
	args = append(args, time.Now())
	argCount++

	query := fmt.Sprintf("UPDATE questions SET %s WHERE id = $%d", strings.Join(setParts, ", "), argCount)
	args = append(args, questionID)

	result, err := db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to update question"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Question not found"})
		return
	}

	// Return updated question
	var updatedQuestion models.Question
	err = db.QueryRow(`
		SELECT id, question_text, options, correct_answer_index, reference, difficulty, created_at
		FROM questions WHERE id = $1`, questionID).Scan(&updatedQuestion.ID, &updatedQuestion.QuestionText,
		&updatedQuestion.Options, &updatedQuestion.CorrectAnswerIndex, &updatedQuestion.Reference,
		&updatedQuestion.Difficulty, &updatedQuestion.CreatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to retrieve updated question"})
		return
	}

	c.JSON(http.StatusOK, updatedQuestion)
}

// DeleteQuestionHandler deletes a question (admin only)
func DeleteQuestionHandler(c *gin.Context) {
	db := database.GetDB()
	questionIDStr := c.Param("id")
	questionID := 0

	if _, err := fmt.Sscanf(questionIDStr, "%d", &questionID); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid question ID"})
		return
	}

	result, err := db.Exec("DELETE FROM questions WHERE id = $1", questionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete question"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Question not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question deleted successfully"})
}
