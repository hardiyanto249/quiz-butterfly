package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"quiz-butterfly/backend/database"
	"quiz-butterfly/backend/models"
)

var jwtSecret = []byte("your-secret-key-change-in-production")

func RegisterHandler(c *gin.Context) {
	db := database.GetDB()

	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	var existingUser models.User
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", strings.ToLower(req.Username)).Scan(&existingUser.ID)
	if err == nil {
		c.JSON(http.StatusConflict, models.ErrorResponse{Error: "Username already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to hash password"})
		return
	}

	var user models.User
	err = db.QueryRow(`
        INSERT INTO users (username, password_hash, created_at, updated_at)
        VALUES ($1, $2, now(), now())
        RETURNING id, username, created_at, updated_at`,
		strings.ToLower(req.Username), string(hashedPassword)).Scan(&user.ID, &user.Username, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create user"})
		return
	}

	// initial high scores
	_, err = db.Exec(`
        INSERT INTO high_scores (user_id, difficulty, score)
        VALUES ($1, 'easy', 0), ($1, 'medium', 0), ($1, 'advance', 0)`,
		user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create high scores"})
		return
	}

	token, err := generateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{User: user, Token: token})
}

func LoginHandler(c *gin.Context) {
	db := database.GetDB()

	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	var user models.User
	err := db.QueryRow(`
        SELECT id, username, password_hash, created_at, updated_at
        FROM users WHERE username = $1`,
		strings.ToLower(req.Username)).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid credentials"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid credentials"})
		return
	}

	token, err := generateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{User: user, Token: token})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid authorization header format"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid token"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("user_id", int(claims["user_id"].(float64)))
			c.Set("username", claims["username"].(string))
		} else {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid token claims"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func generateToken(userID int, username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
		"iat":      time.Now().Unix(),
	})
	return token.SignedString(jwtSecret)
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		username, exists := c.Get("username")
		if !exists || username.(string) != "admin" {
			c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}
