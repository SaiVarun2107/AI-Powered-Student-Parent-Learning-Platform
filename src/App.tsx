import React, { useState, useEffect } from 'react';
import { supabase } from "./lib/supabase";
import { motion, AnimatePresence } from 'motion/react';
import { Student, Quiz, CalendarEvent, PortalSettings } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_QUIZZES, 
  INITIAL_EVENTS, 
  INITIAL_SETTINGS 
} from './data';

// Import Modular Components
import Gateway from './components/Gateway';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import Assessments from './components/Assessments';
import Analytics from './components/Analytics';
import Curriculum from './components/Curriculum';
import AcademicCalendar from './components/Calendar';
import Support from './components/Support';
import PortalSettingsComponent from './components/Settings';
import AddChild from './components/AddChild';
import Admin from './components/Admin';

// Additional inline-icons for Student & Teacher spaces
import { 
  GraduationCap, 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Plus, 
  Calendar, 
  Award,
  Sparkles,
  BookOpen,
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Navigation states
  const [role, setRole] = useState<'gateway' | 'login' | 'parent_portal' | 'student_space' | 'teacher_hub' | 'admin_console'>('gateway');
  const [loginMode, setLoginMode] = useState<'parent' | 'student' | 'teacher' | 'admin'>('parent');
  const [activeParentTab, setActiveParentTab] = useState<string>('dashboard');
  const [parentName, setParentName] = useState<string>('Dr. Eleanor Thorne');

  // Shared application databases
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [settings, setSettings] = useState<PortalSettings>(INITIAL_SETTINGS);

  // Student Space interactive quiz states
  const [activeSolvingQuiz, setActiveSolvingQuiz] = useState<Quiz | null>(null);
  const [solvingAnswers, setSolvingAnswers] = useState<Record<number, string>>({});
  const [quizScoreReport, setQuizScoreReport] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [studentActiveTab, setStudentActiveTab] = useState<string>('learning-path');

  // Student paginated quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({});
  const [quizSecondsLeft, setQuizSecondsLeft] = useState<number>(940);

  // Teacher Hub input states
  const [teacherEventTitle, setTeacherEventTitle] = useState('');
  const [teacherEventDate, setTeacherEventDate] = useState('2024-10-25');
  const [teacherSuccess, setTeacherSuccess] = useState('');
  const [teacherActiveTab, setTeacherActiveTab] = useState<'diagnostics' | 'calendar'>('diagnostics');

  // Find active focused student
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Global modifiers
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => {
      const next = [...prev, newStudent];
      try { localStorage.setItem('students', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setSelectedStudentId(newStudent.id);
    setActiveParentTab('dashboard');
  };

  const handleAddQuiz = (newQuizData: Omit<Quiz, 'id'>) => {
    const newQuiz: Quiz = {
      ...newQuizData,
      id: `q-${Date.now()}`
    };
    setQuizzes(prev => {
      const next = [newQuiz, ...prev];
      try { localStorage.setItem('quizzes', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleAddEvent = (newEventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: `e-${Date.now()}`
    };
    setEvents(prev => {
      const next = [...prev, newEvent];
      try { localStorage.setItem('events', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleSaveSettings = (updatedSettings: PortalSettings) => {
    setSettings(updatedSettings);
    setParentName(updatedSettings.fullName);
    try {
      localStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (e) {
      // ignore
    }
    // persist portal settings (phone, name) into parentProfiles for the logged-in email
    try {
      const profilesRaw = localStorage.getItem('parentProfiles');
      const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
      const key = updatedSettings.email?.trim().toLowerCase();
      if (key) {
        const existing = profiles[key] || {};
        profiles[key] = {
          name: updatedSettings.fullName,
          phone: updatedSettings.phone || existing.phone || '',
          password: existing.password || ''
        };
        localStorage.setItem('parentProfiles', JSON.stringify(profiles));
      }
    } catch (e) {
      // ignore storage errors
    }
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(prev => {
      const next = prev.map(s => s.id === updatedStudent.id ? updatedStudent : s);
      try { localStorage.setItem('students', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => {
      const remaining = prev.filter(s => s.id !== id);
      try { localStorage.setItem('students', JSON.stringify(remaining)); } catch (e) {}
      if (selectedStudentId === id && remaining.length > 0) {
        setSelectedStudentId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Load persisted students from localStorage on mount
  React.useEffect(() => {
    try {
      const rawStudents = localStorage.getItem('students');
      const persistedStudents = rawStudents ? JSON.parse(rawStudents) as Student[] : null;
      if (Array.isArray(persistedStudents) && persistedStudents.length > 0) {
        setStudents(persistedStudents);
      }

      const rawQuizzes = localStorage.getItem('quizzes');
      const persistedQuizzes = rawQuizzes ? JSON.parse(rawQuizzes) as Quiz[] : null;
      if (Array.isArray(persistedQuizzes) && persistedQuizzes.length > 0) {
        setQuizzes(persistedQuizzes);
      }

      const rawEvents = localStorage.getItem('events');
      const persistedEvents = rawEvents ? JSON.parse(rawEvents) as CalendarEvent[] : null;
      if (Array.isArray(persistedEvents) && persistedEvents.length > 0) {
        setEvents(persistedEvents);
      }

      const rawSettings = localStorage.getItem('settings');
      const persistedSettings = rawSettings ? JSON.parse(rawSettings) as PortalSettings : null;
      if (persistedSettings) {
        setSettings(persistedSettings);
      }

      const rawSelected = localStorage.getItem('selectedStudentId');
      if (rawSelected && persistedStudents && persistedStudents.find(s => s.id === rawSelected)) {
        setSelectedStudentId(rawSelected);
      } else if (persistedStudents && persistedStudents.length > 0) {
        setSelectedStudentId(persistedStudents[0].id);
      }

      // also try to restore portal settings from parentProfiles if available
      const profilesRaw = localStorage.getItem('parentProfiles');
      if (profilesRaw) {
        const profiles = JSON.parse(profilesRaw);
        const key = (persistedSettings?.email || settings.email || '').trim().toLowerCase();
        if (key && profiles[key]) {
          setSettings(prev => ({ ...prev, phone: profiles[key].phone || prev.phone }));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (selectedStudentId) {
        localStorage.setItem('selectedStudentId', selectedStudentId);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedStudentId]);

  // Synchronize student data across Parent Portal and Student Space
  useEffect(() => {
    try {
      localStorage.setItem('students', JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  // Synchronize quizzes data across Parent Portal and Student Space
  useEffect(() => {
    try {
      localStorage.setItem('quizzes', JSON.stringify(quizzes));
    } catch (e) {}
  }, [quizzes]);

  // When switching roles between Parent and Student, reload from shared storage
  useEffect(() => {
    try {
      const rawStudents = localStorage.getItem('students');
      if (rawStudents) {
        const parsed = JSON.parse(rawStudents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
        }
      }
      const rawQuizzes = localStorage.getItem('quizzes');
      if (rawQuizzes) {
        const parsed = JSON.parse(rawQuizzes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuizzes(parsed);
        }
      }
    } catch (e) {}
  }, [role]);

  const handleStartSolvingQuiz = (quiz: Quiz) => {
    setActiveSolvingQuiz(quiz);
    setCurrentQuestionIndex(0);
    setBookmarkedQuestions({});
    setVisitedQuestions({ 0: true });
    setQuizScoreReport(null);
    
    const minutes = parseInt(quiz.duration) || 15;
    setQuizSecondsLeft(minutes * 60 - 20); // 15m -> 14m 40s
    setSolvingAnswers({});
  };

  React.useEffect(() => {
    if (!activeSolvingQuiz || isEvaluating || quizScoreReport) return;
    const interval = setInterval(() => {
      setQuizSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSolvingQuiz, isEvaluating, quizScoreReport]);

  const handleGoToQuestion = (idx: number) => {
    setCurrentQuestionIndex(idx);
    setVisitedQuestions(prev => ({ ...prev, [idx]: true }));
  };

  const formatQuizTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Student quiz questions list generator
  const getActiveQuizQuestions = () => {
    if (activeSolvingQuiz && activeSolvingQuiz.questions && activeSolvingQuiz.questions.length > 0) {
      return activeSolvingQuiz.questions;
    }
    // Fallback standard math quiz questions
    return [
      {
        id: 1,
        question: "What are the roots of the quadratic equation: x² - 5x + 6 = 0?",
        type: "mcq" as const,
        options: ["x = 2, 3", "x = -2, -3", "x = 1, 5", "x = 0, 6"],
        correctAnswer: "x = 2, 3"
      },
      {
        id: 2,
        question: "In an Arithmetic Sequence, if the 1st term a = 3 and common difference d = 2, what is the 5th term?",
        type: "mcq" as const,
        options: ["9", "11", "13", "15"],
        correctAnswer: "11"
      },
      {
        id: 3,
        question: "Find the slope of a straight line perpendicular to the line: y = 2x + 7.",
        type: "mcq" as const,
        options: ["-1/2", "2", "-2", "1/2"],
        correctAnswer: "-1/2"
      }
    ];
  };

  // Submit student quiz answers with AI grading evaluation
  const handleGradeStudentQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSolvingQuiz) return;

    setIsEvaluating(true);
    const questions = getActiveQuizQuestions();

    try {
      const response = await fetch('/api/assessment/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: currentStudent?.grade || "Class 10",
          subject: activeSolvingQuiz.subject,
          chapter: activeSolvingQuiz.name,
          questions: questions,
          answers: solvingAnswers
        })
      });

      const data = await response.json();
      const evaluation = data.evaluation;
      const normalizedEvaluation = {
        score: evaluation?.score ?? 0,
        total: evaluation?.total ?? questions.length,
        percentage: evaluation?.percentage ?? 0,
        overallPerformance: evaluation?.overallPerformance ?? 'Good',
        summary: evaluation?.summary ?? 'Assessment completed successfully.',
        strengths: evaluation?.strengths ?? [],
        learningGaps: evaluation?.learningGaps ?? [],
        mistakes: evaluation?.mistakes ?? [],
        recommendations: evaluation?.recommendations ?? [],
        confidence: evaluation?.confidence ?? 'Medium',
        evaluationTimestamp: evaluation?.evaluationTimestamp ?? new Date().toISOString(),
        feedback: evaluation?.summary ?? '',
        weakConcepts: evaluation?.learningGaps ?? [],
        recommendationsDetail: evaluation?.recommendationsDetail ?? {
          topicsToRevise: evaluation?.learningGaps ?? [],
          practiceQuestions: evaluation?.recommendations ?? [],
          revisionPlan: 'Focus on the weakest concept and review one related worksheet today.',
          dailyGoals: 'Spend 15 minutes revisiting the weak concept and one practice set.'
        }
      };

      setQuizzes(prev => prev.map(q => {
        if (q.id === activeSolvingQuiz.id) {
          return {
            ...q,
            score: `${normalizedEvaluation.score}/${normalizedEvaluation.total}`,
            total: normalizedEvaluation.total,
            percentage: normalizedEvaluation.percentage,
            summary: normalizedEvaluation.summary,
            strengths: normalizedEvaluation.strengths,
            learningGaps: normalizedEvaluation.learningGaps,
            mistakes: normalizedEvaluation.mistakes,
            recommendations: normalizedEvaluation.recommendations,
            confidence: normalizedEvaluation.confidence,
            overallPerformance: normalizedEvaluation.overallPerformance,
            evaluationTimestamp: normalizedEvaluation.evaluationTimestamp,
            evaluation: normalizedEvaluation
          };
        }
        return q;
      }));

      setStudents(prev => prev.map(s => {
        if (s.id === activeSolvingQuiz.studentId) {
          return {
            ...s,
            subjects: s.subjects.map(subj => {
              if (subj.name === activeSolvingQuiz.subject) {
                const newComp = Math.min(subj.chaptersCount, subj.completedChapters + 1);
                const newPct = Math.round((newComp / subj.chaptersCount) * 100);
                const newScore = Math.min(100, Math.round((subj.score + normalizedEvaluation.percentage) / 2 || normalizedEvaluation.percentage));
                return {
                  ...subj,
                  completedChapters: newComp,
                  percentage: newPct,
                  score: newScore,
                  status: newPct === 100 ? 'Completed' : 'In Progress'
                };
              }
              return subj;
            })
          };
        }
        return s;
      }));

      setQuizScoreReport(`AI Grading complete! Overall Score: ${normalizedEvaluation.score}/${normalizedEvaluation.total} (${normalizedEvaluation.percentage}%). ${normalizedEvaluation.summary}`);
      setSolvingAnswers({});

    } catch (err) {
      console.error("AI Evaluation failed, applying fallback score calculation", err);
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (solvingAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
      const total = questions.length;
      const percentage = Math.round((correctCount / total) * 100);
      const fallbackEvaluation = {
        score: correctCount,
        total,
        percentage,
        overallPerformance: percentage >= 80 ? 'Good' : 'Needs Improvement',
        summary: `The quiz was completed with ${percentage}% accuracy. Review the key concepts and try another short practice set.`,
        strengths: ['Steady effort'],
        learningGaps: ['Core concept review'],
        mistakes: [],
        recommendations: ['Review the answer explanations', 'Practice a short follow-up quiz'],
        confidence: percentage >= 80 ? 'High' : 'Medium',
        evaluationTimestamp: new Date().toISOString(),
        feedback: `The quiz was completed with ${percentage}% accuracy.`,
        weakConcepts: ['Core concept review'],
        recommendationsDetail: {
          topicsToRevise: ['Core concept review'],
          practiceQuestions: ['Practice a short follow-up quiz'],
          revisionPlan: 'Review the incorrect answers and try a similar problem set.',
          dailyGoals: 'Spend 10 minutes revisiting the weakest concept.'
        }
      };

      setQuizzes(prev => prev.map(q => {
        if (q.id === activeSolvingQuiz.id) {
          return {
            ...q,
            score: `${fallbackEvaluation.score}/${fallbackEvaluation.total}`,
            total: fallbackEvaluation.total,
            percentage: fallbackEvaluation.percentage,
            summary: fallbackEvaluation.summary,
            strengths: fallbackEvaluation.strengths,
            learningGaps: fallbackEvaluation.learningGaps,
            mistakes: fallbackEvaluation.mistakes,
            recommendations: fallbackEvaluation.recommendations,
            confidence: fallbackEvaluation.confidence,
            overallPerformance: fallbackEvaluation.overallPerformance,
            evaluationTimestamp: fallbackEvaluation.evaluationTimestamp,
            evaluation: fallbackEvaluation
          };
        }
        return q;
      }));

      setStudents(prev => prev.map(s => {
        if (s.id === activeSolvingQuiz.studentId) {
          return {
            ...s,
            subjects: s.subjects.map(subj => {
              if (subj.name === activeSolvingQuiz.subject) {
                const newComp = Math.min(subj.chaptersCount, subj.completedChapters + 1);
                const newPct = Math.round((newComp / subj.chaptersCount) * 100);
                const newScore = Math.min(100, Math.round((subj.score + fallbackEvaluation.percentage) / 2 || fallbackEvaluation.percentage));
                return {
                  ...subj,
                  completedChapters: newComp,
                  percentage: newPct,
                  score: newScore,
                  status: newPct === 100 ? 'Completed' : 'In Progress'
                };
              }
              return subj;
            })
          };
        }
        return s;
      }));

      setQuizScoreReport(`Evaluation uploaded. You scored ${correctCount}/${total} correct. ${fallbackEvaluation.summary}`);
      setSolvingAnswers({});
    } finally {
      setIsEvaluating(false);
    }
  };

  // Teacher posts new class-wide activity
  const handleTeacherPostEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEventTitle) return;

    handleAddEvent({
      title: `Teacher Post: ${teacherEventTitle}`,
      date: teacherEventDate,
      type: 'activity'
    });

    setTeacherEventTitle('');
    setTeacherSuccess(`Successfully posted school activity "${teacherEventTitle}" to the parent calendar database.`);
    setTimeout(() => {
      setTeacherSuccess('');
    }, 4000);
  };

  // Render Parent Portal main screens
  const renderParentContent = () => {
    const getContent = () => {
      switch (activeParentTab) {
        case 'dashboard':
          return (
            <Dashboard
              students={students}
              quizzes={quizzes}
              events={events}
              parentName={parentName}
              onSelectStudent={setSelectedStudentId}
              onChangeTab={setActiveParentTab}
              onAddStudentClick={() => setActiveParentTab('add-child')}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          );
        case 'learning-path':
          return (
            currentStudent ? (
              <LearningPath
                student={currentStudent}
                quizzes={quizzes}
                onChangeTab={setActiveParentTab}
              />
            ) : (
              <div className="p-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center">
                  <h3 className="font-sans font-bold text-lg text-slate-900">No student selected</h3>
                  <p className="text-sm text-slate-500 mt-2">Add a child profile to view the learning path and personalized recommendations.</p>
                  <div className="mt-4">
                    <button onClick={() => setActiveParentTab('add-child')} className="py-2 px-4 bg-orange-600 text-white rounded-xl">Add Student Profile</button>
                  </div>
                </div>
              </div>
            )
          );
        case 'assessments':
          return (
            <Assessments
              students={students}
              selectedStudentId={selectedStudentId}
              quizzes={quizzes}
              onAddQuiz={handleAddQuiz}
            />
          );
        case 'analytics':
          return (
            currentStudent ? (
              <Analytics
                student={currentStudent}
                quizzes={quizzes}
                onChangeTab={setActiveParentTab}
              />
            ) : (
              <div className="p-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center">
                  <h3 className="font-sans font-bold text-lg text-slate-900">No student selected</h3>
                  <p className="text-sm text-slate-500 mt-2">Add a child profile to view analytics and diagnostics.</p>
                  <div className="mt-4">
                    <button onClick={() => setActiveParentTab('add-child')} className="py-2 px-4 bg-orange-600 text-white rounded-xl">Add Student Profile</button>
                  </div>
                </div>
              </div>
            )
          );
        case 'curriculum':
            return (
              currentStudent ? (
                <Curriculum
                  student={currentStudent}
                />
              ) : (
                <div className="p-6">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center">
                    <h3 className="font-sans font-bold text-lg text-slate-900">No student selected</h3>
                    <p className="text-sm text-slate-500 mt-2">Add a child profile to explore the curriculum and track chapter completion.</p>
                    <div className="mt-4">
                      <button onClick={() => setActiveParentTab('add-child')} className="py-2 px-4 bg-orange-600 text-white rounded-xl">Add Student Profile</button>
                    </div>
                  </div>
                </div>
              )
            );
        case 'calendar':
          return (
            currentStudent ? (
              <AcademicCalendar
                events={events}
                selectedStudentId={selectedStudentId}
                studentName={currentStudent.name}
                onAddEvent={handleAddEvent}
              />
            ) : (
              <div className="p-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center">
                  <h3 className="font-sans font-bold text-lg text-slate-900">No student selected</h3>
                  <p className="text-sm text-slate-500 mt-2">Add a child profile to view and schedule academic events.</p>
                  <div className="mt-4">
                    <button onClick={() => setActiveParentTab('add-child')} className="py-2 px-4 bg-orange-600 text-white rounded-xl">Add Student Profile</button>
                  </div>
                </div>
              </div>
            )
          );
        case 'support':
          return (
            <Support
              parentName={parentName}
            />
          );
        case 'settings':
          return (
            <PortalSettingsComponent
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          );
        case 'add-child':
          return (
            <AddChild
              onBack={() => setActiveParentTab('dashboard')}
              onAddStudent={handleAddStudent}
            />
          );
        default:
          return <div className="p-6 text-slate-500 font-sans">Tab workspace coming soon.</div>;
      }
    };

    return (
      <motion.div
        key={activeParentTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        {getContent()}
      </motion.div>
    );
  };

  const completedQuiz = quizzes.find((quiz) => quiz.id === activeSolvingQuiz?.id);
  const completedEvaluation = completedQuiz?.evaluation ?? null;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden flex flex-col">
      <AnimatePresence mode="wait">
        
        {/* 1. GATEWAY SCREEN (Switch Role Launcher) */}
        {role === 'gateway' && (
          <motion.div
            key="gateway"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <Gateway 
              onSelectRole={(selectedRole) => {
                setLoginMode(selectedRole);
                setRole('login');
              }} 
            />
          </motion.div>
        )}

        {/* 2. LOGIN SCREEN (Parent / Student / Teacher Verification) */}
        {role === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <Login
              mode={loginMode}
              onBack={() => setRole('gateway')}
              onLoginSuccess={(name, email) => {
                if (loginMode === 'parent') {
                    // load persisted parent profile (if any)
                    const profilesRaw = localStorage.getItem('parentProfiles');
                    const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
                    const key = email?.trim().toLowerCase() || '';
                    const stored = key ? profiles[key] : null;
                    setParentName(name);
                    // update portal settings to reflect logged-in parent's profile
                    setSettings(prev => ({
                      ...prev,
                      fullName: name,
                      email: email || prev.email,
                      phone: stored?.phone || prev.phone || ''
                    }));
                  setRole('parent_portal');
                  setActiveParentTab('dashboard');
                  // Keep previously assigned children loaded from persistence.
                  // Do not clear students so added children remain across logins.
                  if (!selectedStudentId && students.length > 0) {
                    setSelectedStudentId(students[0].id);
                  }
                } else if (loginMode === 'student') {
                  const matchedStudent = (email && students.find(s => s.email.toLowerCase() === email.toLowerCase()))
                    || students.find(s => s.name.toLowerCase() === name.toLowerCase())
                    || students.find(s => s.id === 'julian-stark') || students[0];
                  if (matchedStudent) {
                    setSelectedStudentId(matchedStudent.id);
                  }
                  setRole('student_space');
                } else if (loginMode === 'teacher') {
                  setRole('teacher_hub');
                } else if (loginMode === 'admin') {
                  setRole('admin_console');
                }
              }}
            />
          </motion.div>
        )}

        {/* 3. PARENT PORTAL HUB */}
        {role === 'parent_portal' && (
          <motion.div
            key="parent_portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="flex h-screen overflow-hidden w-full"
          >
            {/* Shared Portal Sidebar */}
            <Sidebar
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              activeTab={activeParentTab}
              onChangeTab={setActiveParentTab}
              onAddChildClick={() => setActiveParentTab('add-child')}
              onLogout={() => setRole('gateway')}
              parentName={parentName}
            />

            {/* Core scrollable work panels */}
            <main className="flex-1 overflow-y-auto bg-white">
              {renderParentContent()}
            </main>
          </motion.div>
        )}

        {/* 4. STUDENT SPACE (Student Desk Assessments Workspace) */}
        {role === 'student_space' && (
          <motion.div
            key="student_space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="min-h-screen bg-white text-slate-900 flex flex-col w-full"
          >
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setRole('gateway');
                    setActiveSolvingQuiz(null);
                    setQuizScoreReport(null);
                  }}
                  className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <span className="text-[10px] font-mono text-orange-600 tracking-wider uppercase block">Student Workspace</span>
                  <h1 className="text-base font-sans font-extrabold text-orange-600 leading-tight">LAUNCH DESK &mdash; {currentStudent?.name.toUpperCase() || 'STUDENT'}</h1>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] font-mono text-slate-400 block">{currentStudent?.grade || 'Class 10'} State Syllabus</span>
                <span className="text-xs font-sans font-bold text-slate-700">Eduvia Student Desks</span>
              </div>
            </header>

            {/* Student Navigation Tabs */}
            <div className="flex flex-1">

  {!activeSolvingQuiz && (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 shrink-0">

      {[
        { id: 'learning-path', name: 'My Path' },
        { id: 'assignments', name: 'My Assignments' },
        { id: 'analytics', name: 'Performance Analytics' },
        { id: 'curriculum', name: 'Syllabus & Curriculum' },
        { id: 'calendar', name: 'Academic Calendar' },
        { id: 'support', name: 'Help Center' },
        { id: 'settings', name: 'Portal Settings' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setStudentActiveTab(tab.id)}
          className={`w-full text-left py-3 px-4 rounded-xl font-sans font-semibold text-xs transition-all ${
            studentActiveTab === tab.id
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {tab.name}
        </button>
      ))}

    </aside>
  )}

  <main
    className={`flex-1 overflow-y-auto p-6 mx-auto w-full space-y-8 ${
      activeSolvingQuiz
        ? 'max-w-7xl'
        : (
            studentActiveTab === 'learning-path' ||
            studentActiveTab === 'analytics'
          )
        ? 'max-w-5xl'
        : 'max-w-4xl'
    }`}
  >
              
              {/* Active Quiz Solvings Overlay */}
              {activeSolvingQuiz ? (
                <div className="w-full">
                  {isEvaluating ? (
                    /* AI Evaluation Loading Spinner */
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative py-16 text-center space-y-5">
                      <div className="relative inline-block">
                        <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin flex items-center justify-center shadow-lg">
                          <Sparkles size={26} className="text-orange-500 animate-pulse" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-sans font-bold text-base text-slate-800">AI Evaluation Platform Active</h3>
                        <p className="text-slate-500 text-xs font-sans max-w-md leading-relaxed mx-auto">
                          Gemini is grading the student paper. Assessing conceptual explanations, calculating correct responses, and building customized recommendations...
                        </p>
                      </div>
                    </div>
                  ) : quizScoreReport ? (
                    /* Quiz Scored Success Banner */
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative text-center py-12 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle size={24} />
                      </div>
                      <h2 className="text-xl font-sans font-bold text-slate-900">AI Assessment Report Ready</h2>
                      <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">{quizScoreReport}</p>
                      {completedEvaluation && (
                        <div className="mt-4 text-left space-y-3 max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-orange-700">Overall Score</span>
                            <span className="font-sans font-bold text-slate-900">{completedEvaluation.score}/{completedEvaluation.total} ({completedEvaluation.percentage}%)</span>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700">{completedEvaluation.overallPerformance}</span>
                          </div>
                          <div>
                            <p className="font-sans font-semibold text-slate-800">AI Summary</p>
                            <p className="text-xs leading-relaxed">{completedEvaluation.summary}</p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="font-sans font-semibold text-slate-800">Strengths</p>
                              <ul className="mt-1 list-disc pl-5 text-xs leading-relaxed">
                                {completedEvaluation.strengths?.map((strength: string) => <li key={strength}>{strength}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="font-sans font-semibold text-slate-800">Weak Concepts</p>
                              <ul className="mt-1 list-disc pl-5 text-xs leading-relaxed">
                                {completedEvaluation.learningGaps?.map((gap: string) => <li key={gap}>{gap}</li>)}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <p className="font-sans font-semibold text-slate-800">Recommendations</p>
                            <ul className="mt-1 list-disc pl-5 text-xs leading-relaxed">
                              {completedEvaluation.recommendations?.map((item: string) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setActiveSolvingQuiz(null);
                          setQuizScoreReport(null);
                        }}
                        className="mt-4 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs cursor-pointer transition-colors shadow-lg shadow-orange-600/10"
                      >
                        Back to Desk Launcher
                      </button>
                    </div>
                  ) : (
                    /* Active Solving Form (Paginated / One-by-One Layout) */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Sidebar Control Panel */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-orange-600 uppercase tracking-wider block">Quiz Test</span>
                          {/* Stylized selector representing the select box in screenshot */}
                          <div className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-sans font-bold text-slate-800 shadow-inner">
                            <span className="truncate pr-2">{activeSolvingQuiz.name}</span>
                            <ChevronRight size={14} className="rotate-90 text-slate-400 shrink-0" />
                          </div>
                        </div>

                        {/* Grid of Question Numbers */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Question Index</span>
                          <div className="grid grid-cols-5 gap-2">
                            {getActiveQuizQuestions().map((q, idx) => {
                              const isCurrent = currentQuestionIndex === idx;
                              const isAnswered = solvingAnswers[idx] !== undefined && solvingAnswers[idx] !== '';
                              const isBookmarked = bookmarkedQuestions[idx] === true;
                              const isVisited = visitedQuestions[idx] === true;

                              // Style calculation
                              let btnStyle = "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"; // Default: Not Visited
                              if (isCurrent) {
                                btnStyle = "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/10";
                              } else if (isAnswered && isBookmarked) {
                                btnStyle = "bg-emerald-600 border-amber-500 text-white border-2";
                              } else if (isAnswered) {
                                btnStyle = "bg-emerald-600 border-emerald-500 text-white shadow-sm";
                              } else if (isBookmarked) {
                                btnStyle = "bg-blue-100 border-blue-300 text-blue-700 font-semibold";
                              } else if (isVisited) {
                                btnStyle = "bg-rose-100 border-rose-300 text-rose-700 font-semibold"; // Visited but not Answered
                              }

                              return (
                                <button
                                  type="button"
                                  key={q.id}
                                  onClick={() => handleGoToQuestion(idx)}
                                  className={`w-10 h-10 rounded-xl font-mono text-xs font-bold border flex items-center justify-center transition-all cursor-pointer relative ${btnStyle}`}
                                >
                                  {idx + 1}
                                  {isAnswered && isBookmarked && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-bl-md rounded-tr-lg" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Legend Block */}
                        <div className="pt-5 border-t border-slate-100 space-y-3">
                          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest block">Status Legend</span>
                          <div className="grid grid-cols-1 gap-2 font-mono text-[10px] text-slate-500">
                            <div className="flex items-center gap-2.5">
                              <span className="w-4 h-4 rounded-lg bg-emerald-600 border border-emerald-500 block shrink-0" />
                              <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-4 h-4 rounded-lg bg-rose-100 border border-rose-300 block shrink-0" />
                              <span>Visited but Not Answered</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-4 h-4 rounded-lg bg-blue-100 border border-blue-300 block shrink-0" />
                              <span>Bookmarked</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-4 h-4 rounded-lg bg-emerald-600 border-2 border-amber-500 block relative overflow-hidden shrink-0">
                                <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-sm" />
                              </span>
                              <span>Attempted &amp; Bookmarked</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-4 h-4 rounded-lg bg-white border border-slate-200 block shrink-0" />
                              <span>Not Visited</span>
                            </div>
                          </div>
                        </div>

                        {/* Remaining Time Section */}
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 mt-2">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <Clock size={18} className="animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Remaining Time</span>
                            <span className="text-lg font-mono font-extrabold text-orange-600">
                              {formatQuizTime(quizSecondsLeft)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Main Question Workspace */}
                      <form onSubmit={handleGradeStudentQuiz} className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
                        {/* Header Area */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-mono font-bold text-orange-600">
                                Question {currentQuestionIndex + 1} of {getActiveQuizQuestions().length}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {Math.round((Object.keys(solvingAnswers).length / getActiveQuizQuestions().length) * 100)}% Complete
                              </div>
                            </div>

                            {/* Bookmark / Review Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setBookmarkedQuestions(prev => ({ ...prev, [currentQuestionIndex]: !prev[currentQuestionIndex] }));
                              }}
                              className={`py-2 px-3.5 rounded-xl border font-sans font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                bookmarkedQuestions[currentQuestionIndex]
                                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <Bookmark size={14} fill={bookmarkedQuestions[currentQuestionIndex] ? "currentColor" : "none"} />
                              <span>Bookmark Question</span>
                            </button>
                          </div>

                          {/* Progress slider track */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 transition-all duration-300"
                              style={{ width: `${(Object.keys(solvingAnswers).length / getActiveQuizQuestions().length) * 100}%` }}
                            />
                          </div>

                          {/* Active Question Body */}
                          <div className="py-6 space-y-6">
                            <h2 className="text-lg md:text-xl font-sans font-bold text-slate-800 leading-snug">
                              {getActiveQuizQuestions()[currentQuestionIndex]?.question}
                            </h2>

                            {/* Option Items */}
                            {getActiveQuizQuestions()[currentQuestionIndex]?.options?.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3 pt-2">
                                {(
                                  getActiveQuizQuestions()[currentQuestionIndex]?.options && getActiveQuizQuestions()[currentQuestionIndex]?.options.length > 0 
                                    ? getActiveQuizQuestions()[currentQuestionIndex]?.options 
                                    : (getActiveQuizQuestions()[currentQuestionIndex]?.type === 'true_false' ? ["True", "False"] : [])
                                ).map((opt) => {
                                  const isSelected = solvingAnswers[currentQuestionIndex] === opt;
                                  return (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => {
                                        setSolvingAnswers(prev => ({ ...prev, [currentQuestionIndex]: opt }));
                                        setVisitedQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));
                                      }}
                                      className={`p-4 text-left rounded-2xl text-sm font-sans border transition-all cursor-pointer flex items-center justify-between ${
                                        isSelected 
                                          ? 'bg-emerald-50/60 border-emerald-500 text-slate-900 shadow-sm font-semibold' 
                                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                                      }`}>
                                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="pt-2">
                                <textarea
                                  value={solvingAnswers[currentQuestionIndex] || ''}
                                  onChange={(e) => {
                                    setSolvingAnswers(prev => ({ ...prev, [currentQuestionIndex]: e.target.value }));
                                    setVisitedQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));
                                  }}
                                  placeholder="Type your brief conceptual answer or explanation here..."
                                  rows={5}
                                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-sans text-slate-800 outline-none focus:border-orange-500 transition-colors"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Navigation controls footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-100 gap-4 mt-8">
                          <div className="flex gap-2 w-full sm:w-auto">
                            {/* Abort button styled cleanly */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSolvingQuiz(null);
                                setSolvingAnswers({});
                              }}
                              className="flex-1 sm:flex-initial py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-sans font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer"
                            >
                              Abort
                            </button>

                            {/* Back Button */}
                            <button
                              type="button"
                              disabled={currentQuestionIndex === 0}
                              onClick={() => handleGoToQuestion(currentQuestionIndex - 1)}
                              className="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-sans font-semibold text-xs rounded-xl border border-slate-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1"
                            >
                              <ChevronLeft size={14} />
                              <span>Back</span>
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end">
                            {/* Mark for Review Label Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={bookmarkedQuestions[currentQuestionIndex] === true}
                                onChange={() => setBookmarkedQuestions(prev => ({ ...prev, [currentQuestionIndex]: !prev[currentQuestionIndex] }))}
                                className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                              />
                              <span className="text-xs font-sans font-semibold text-slate-500">Mark for Review</span>
                            </label>

                            {/* Next / Submit Button */}
                            {currentQuestionIndex < getActiveQuizQuestions().length - 1 ? (
                              <button
                                type="button"
                                onClick={() => handleGoToQuestion(currentQuestionIndex + 1)}
                                className="w-full sm:w-auto py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Next Question</span>
                                <ChevronRight size={14} />
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1"
                              >
                                <CheckCircle size={14} />
                                <span>Submit Test</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : studentActiveTab === 'learning-path' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 animate-fade-in">
                  <LearningPath
                    student={currentStudent}
                    quizzes={quizzes}
                    onChangeTab={setStudentActiveTab}
                  />
                </div>
              ) : studentActiveTab === 'analytics' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 animate-fade-in">
                  <Analytics
                    student={currentStudent}
                    quizzes={quizzes}
                    onChangeTab={setStudentActiveTab}
                  />
                </div>
              ) : studentActiveTab === 'curriculum' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 animate-fade-in">
                  <Curriculum
                    student={currentStudent}
                  />
                </div>
              ) : studentActiveTab === 'support' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 animate-fade-in">
                  <Support
                    parentName={currentStudent?.name || 'Student'}
                  />
                </div>
              ) : studentActiveTab === 'settings' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 animate-fade-in">
                  <PortalSettingsComponent
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                  />
                </div>
              ) : studentActiveTab === 'calendar' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-2">
                  <AcademicCalendar
                    events={events}
                    selectedStudentId={selectedStudentId}
                    studentName={currentStudent?.name || 'Student'}
                    onAddEvent={handleAddEvent}
                  />
                </div>
              ) : (
                /* Student Launcher Desktop (My Assignments) */
                <div className="space-y-6">
                  
                  {/* Desk banner */}
                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center justify-between text-orange-950 shadow-sm animate-fade-in">
                    <div>
                      <h2 className="text-xl font-sans font-extrabold tracking-tight text-orange-600">Active Student Assignments</h2>
                      <p className="text-xs text-slate-500 mt-1 font-sans">
                        Complete target quizzes delegated by your parents to update diagnostic telemetry charts.
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center border border-orange-200/50">
                      <GraduationCap size={24} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column - Assigned Portal Evaluations */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="font-sans font-bold text-sm text-orange-600 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span>Assigned Portal Evaluations</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {quizzes.filter(q => q.studentId === selectedStudentId).length} ACTIVE
                        </span>
                      </h3>

                      <div className="space-y-3">
                        {quizzes.filter(q => q.studentId === selectedStudentId).map((quiz) => {
                          const isPending = !quiz.score;
                          return (
                            <div key={quiz.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[9px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                  {quiz.subject}
                                </span>
                                <h4 className="font-sans font-bold text-xs text-slate-800 mt-2">{quiz.name}</h4>
                                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                                  Duration: {quiz.duration} • Scheduled: {quiz.date}
                                </span>
                              </div>

                              <div>
                                {isPending ? (
                                  <button
                                    onClick={() => handleStartSolvingQuiz(quiz)}
                                    className="py-2 px-3.5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <Play size={12} fill="white" />
                                    <span>START</span>
                                  </button>
                                ) : (
                                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                                    AI Report • {quiz.score}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column - Upcoming Calendar Events */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-sans font-bold text-sm text-orange-600 flex items-center gap-2">
                          <Calendar size={15} />
                          <span>Academic Milestones</span>
                        </h3>
                        <button
                          onClick={() => setStudentActiveTab('calendar')}
                          className="text-[10px] font-sans font-semibold text-orange-600 hover:text-orange-500 cursor-pointer"
                        >
                          View Full Calendar
                        </button>
                      </div>

                      <div className="space-y-3">
                        {events
                          .filter(e => !e.studentId || e.studentId === selectedStudentId)
                          .slice(0, 4)
                          .map((ev) => {
                            let badgeStyle = "bg-orange-50 border-orange-100 text-orange-700";
                            if (ev.type === 'exam') badgeStyle = "bg-rose-50 border-rose-100 text-rose-700";
                            if (ev.type === 'assessment') badgeStyle = "bg-purple-50 border-purple-100 text-purple-700";
                            if (ev.type === 'holiday') badgeStyle = "bg-amber-50 border-amber-100 text-amber-700";

                            return (
                              <div key={ev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                                <div className={`px-2 py-1 rounded-lg border text-[9px] font-mono font-bold uppercase shrink-0 text-center ${badgeStyle}`}>
                                  {ev.type}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-sans font-bold text-xs text-slate-800 leading-tight">
                                    {ev.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {ev.date}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                        {events.filter(e => !e.studentId || e.studentId === selectedStudentId).length === 0 && (
                          <div className="text-center py-6 text-slate-400 font-sans text-xs">
                            No upcoming milestones configured.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </main>
            </div>
          </motion.div>
        )}

        {/* 5. TEACHER HUB */}
        {role === 'teacher_hub' && (
          <motion.div
            key="teacher_hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="min-h-screen bg-white text-slate-900 flex flex-col w-full"
          >
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRole('gateway')}
                  className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <span className="text-[10px] font-mono text-orange-600 tracking-wider uppercase block">Eduvia Educator Platform</span>
                  <h1 className="text-base font-sans font-extrabold text-orange-600 leading-tight">Teacher Hub Terminal</h1>
                </div>
              </div>
              
              <span className="text-[11px] font-mono text-orange-600 bg-orange-50 px-3 py-1 rounded border border-orange-100 uppercase font-semibold">
                Adviser Mode Active
              </span>
            </header>

            {/* Teacher Navigation Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-3">
              <button
                onClick={() => setTeacherActiveTab('diagnostics')}
                className={`py-2 px-4 rounded-xl font-sans font-semibold text-xs cursor-pointer transition-all ${
                  teacherActiveTab === 'diagnostics'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/15'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Classroom Diagnostics
              </button>
              <button
                onClick={() => setTeacherActiveTab('calendar')}
                className={`py-2 px-4 rounded-xl font-sans font-semibold text-xs cursor-pointer transition-all ${
                  teacherActiveTab === 'calendar'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/15'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Academic Calendar
              </button>
            </div>

            <main className="flex-1 overflow-y-auto  p-6 max-w-5xl mx-auto w-full space-y-8">
              {teacherActiveTab === 'calendar' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-2">
                  <AcademicCalendar
                    events={events}
                    selectedStudentId={selectedStudentId}
                    studentName="Classroom"
                    onAddEvent={handleAddEvent}
                  />
                </div>
              ) : (
                <>
                  {/* Teacher Dashboard Banner */}
                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center justify-between text-orange-950">
                    <div className="space-y-1">
                      <h2 className="text-lg font-sans font-bold text-orange-600">Classroom Diagnostics Overview</h2>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-md">
                        Update shared school-wide agendas, manage diagnostic exam dates, and evaluate active pupil completions.
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center border border-orange-200">
                      <Users size={22} />
                    </div>
                  </div>

                  {teacherSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-xs font-sans flex gap-2 items-center">
                      <CheckCircle size={15} />
                      <span>{teacherSuccess}</span>
                    </div>
                  )}

                  {/* Grid Layout: Calendar Poster (Left) & Students List (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Event Poster Form */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="font-sans font-bold text-xs text-orange-600 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Calendar size={14} className="text-orange-600" />
                        <span>Schedule School Agenda Event</span>
                      </h3>

                      <form onSubmit={handleTeacherPostEvent} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Event Description / Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Science Board Quarterly Exam"
                            value={teacherEventTitle}
                            onChange={(e) => setTeacherEventTitle(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Execution Date</label>
                          <input
                            type="date"
                            required
                            value={teacherEventDate}
                            onChange={(e) => setTeacherEventDate(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-850 outline-none focus:border-orange-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs transition-all shadow-md shadow-orange-600/15 cursor-pointer"
                        >
                          Post Event Live
                        </button>
                      </form>
                    </div>

                    {/* Students Grades Matrix List */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="font-sans font-bold text-xs text-orange-600 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100">
                        Registered Classroom Roster &amp; Status
                      </h3>

                      <div className="divide-y divide-slate-100">
                        {students.map((student) => {
                          const avgComp = Math.round(student.subjects.reduce((sum, s) => sum + s.percentage, 0) / (student.subjects.length || 1));
                          return (
                            <div key={student.id} className="py-3 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${student.avatarColor} text-white flex items-center justify-center font-bold text-xs font-mono`}>
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-sans font-bold text-xs text-slate-800 block">{student.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-mono">{student.grade} • {student.board}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-bold text-orange-600 block">{avgComp}% Mastery Avg</span>
                                <span className="text-[10px] text-slate-400 block font-mono">{student.subjects.length} Tracks Configured</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </main>
          </motion.div>
        )}

        {/* 6. ADMIN CONSOLE */}
        {role === 'admin_console' && (
          <motion.div
            key="admin_console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="min-h-screen bg-slate-50 w-full"
          >
            <Admin onBack={() => setRole('gateway')} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
