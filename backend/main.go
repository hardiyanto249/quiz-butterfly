package main

import (
	"log"
	"os"

	"quiz-butterfly/backend/database"
	"quiz-butterfly/backend/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.InitDB()
	defer database.CloseDB()

	// Set Gin mode
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug"
	}
	gin.SetMode(ginMode)

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Quiz Butterfly API is running",
		})
	})

	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", handlers.RegisterHandler)
		auth.POST("/login", handlers.LoginHandler)
	}

	// Protected routes
	api := r.Group("/api")
	api.Use(handlers.AuthMiddleware())
	{
		api.GET("/profile", handlers.GetProfileHandler)
		api.POST("/quiz/start", handlers.StartQuizHandler)
		api.POST("/quiz/answer", handlers.SubmitAnswerHandler)
		api.GET("/quiz/progress", handlers.GetQuizProgressHandler)
		api.POST("/quiz/finish", handlers.FinishQuizHandler)
		// Admin routes
		admin := api.Group("/admin")
		admin.Use(handlers.AdminMiddleware())
		{
			admin.POST("/questions", handlers.CreateQuestionHandler)
			admin.PUT("/questions/:id", handlers.UpdateQuestionHandler)
			admin.DELETE("/questions/:id", handlers.DeleteQuestionHandler)
		}
		api.GET("/questions/:difficulty", handlers.GetQuestionsHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
