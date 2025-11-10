
export type Difficulty = 'easy' | 'medium' | 'advance';

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  reference: string;
  difficulty: Difficulty;
}

export interface UserAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  reference: string;
}

export type QuizState = 'playing' | 'finished';

export interface User {
  username: string;
  password?: string; // Stored hashed in a real app
  highScores: {
    easy: number;
    medium: number;
    advance: number;
  };
}

export interface QuizProgress {
  difficulty: Difficulty;
  currentQuestionIndex: number;
  score: number;
  userAnswers: UserAnswer[];
}
