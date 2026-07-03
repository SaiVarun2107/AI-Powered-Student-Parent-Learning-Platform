export interface Subject {
  id: string;
  name: string;
  chaptersCount: number;
  completedChapters: number;
  percentage: number;
  score: number; // e.g. 94/100
  status: 'Completed' | 'In Progress' | 'Locked';
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  school: string;
  board: string;
  academicYearFrom: string;
  academicYearTo: string;
  email: string;
  subjects: Subject[];
  avatarColor: string;
}

export interface Question {
  id: number;
  question: string;
  type: 'mcq' | 'short_answer' | 'conceptual' | 'true_false';
  options?: string[];
  correctAnswer: string;
}

export interface QuizMistake {
  question: number;
  reason: string;
}

export interface EvaluationResult {
  score: number;
  total: number;
  percentage: number;
  overallPerformance: string;
  summary: string;
  strengths: string[];
  learningGaps: string[];
  mistakes: QuizMistake[];
  recommendations: string[];
  confidence: string;
  evaluationTimestamp?: string;
  feedback?: string;
  weakConcepts?: string[];
  recommendationsDetail?: {
    topicsToRevise: string[];
    practiceQuestions: string[];
    revisionPlan: string;
    dailyGoals: string;
  };
}

export interface Quiz {
  id: string;
  name: string;
  subject: string;
  date: string;
  questionsCount: number;
  score?: string;
  total?: number;
  percentage?: number;
  summary?: string;
  strengths?: string[];
  learningGaps?: string[];
  mistakes?: QuizMistake[];
  recommendations?: string[];
  confidence?: string;
  overallPerformance?: string;
  evaluationTimestamp?: string;
  duration: string;
  studentId: string;
  questions?: Question[];
  evaluation?: EvaluationResult | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'exam' | 'assessment' | 'activity' | 'holiday';
  studentId?: string;
  studentName?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface PortalSettings {
  fullName: string;
  email: string;
  phone: string;
  emailAlerts: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  language: string;
  twoFactorEnabled: boolean;
}
