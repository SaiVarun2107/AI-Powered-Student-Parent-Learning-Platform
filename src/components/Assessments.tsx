import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Student, Quiz } from '../types';
import { 
  Award, 
  Clock, 
  HelpCircle, 
  BookOpen,  
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { MATH_TOPICS_GRADE_10 } from '../data';

interface AssessmentsProps {
  students: Student[];
  selectedStudentId: string;
  quizzes: Quiz[];
  onAddQuiz: (quiz: Omit<Quiz, 'id'>) => void;
}

export default function Assessments({
  students,
  selectedStudentId,
  quizzes,
  onAddQuiz
}: AssessmentsProps) {
  // Form State
  const [studentId, setStudentId] = useState(selectedStudentId);
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState('15m');
  const [topic, setTopic] = useState('');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Dynamic generating indicator
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Notice Alert state
  const [successBanner, setSuccessBanner] = useState('');

  // Synchronize student selection from sidebar
  useEffect(() => {
    setStudentId(selectedStudentId);
  }, [selectedStudentId]);

  // Selected Student Object
  const currentStudent = students.find(s => s.id === studentId) || students[0];

  // Set default subject and topics when student changes
  useEffect(() => {
    if (currentStudent && currentStudent.subjects.length > 0) {
      setSubjectId(currentStudent.subjects[0].id);
    }
  }, [studentId]);

  // Current Subject Object
  const currentSubject = currentStudent?.subjects.find(s => s.id === subjectId);

  // Available topics based on subject
  const getTopicsForSubject = () => {

  if (!currentSubject || !currentStudent) return [];

  if (currentSubject.id === "math") {

    // ==========================
    // CLASS 9 MATHEMATICS
    // ==========================
    if (currentStudent.grade === "Class 9") {
      return [
        "Real Numbers",
        "Polynomials and Factorisation",
        "The Elements of Geometry",
        "Lines and Angles",
        "Co-Ordinate Geometry",
        "Linear Equations in Two Variables",
        "Triangles",
        "Quadrilaterals",
        "Statistics",
        "Surface Areas and Volumes",
        "Areas",
        "Circles",
        "Geometrical Constructions",
        "Probability",
        "Proofs in Mathematics Revision"
      ];
    }

    // ==========================
    // CLASS 10 MATHEMATICS
    // ==========================
    if (currentStudent.grade === "Class 10") {
      return [
        "Real Numbers",
        "Sets",
        "Polynomials",
        "Pair of Linear Equations in Two Variables",
        "Quadratic Equations",
        "Progressions",
        "Coordinate Geometry",
        "Similar Triangles",
        "Tangents and Secants to a Circle",
        "Mensuration",
        "Trigonometry",
        "Applications of Trigonometry",
        "Probability",
        "Statistics"
      ];
    }
  }

  if (currentSubject.id === "science") {
    return [
      "Chemical Compounds",
      "Balancing Equations",
      "Cellular Division",
      "Genetics & DNA",
      "Newtonian Kinetics"
    ];
  }

  if (currentSubject.id === "lit") {
    return [
      "Motif Identification",
      "Victorian Criticism",
      "Poetry Metrics",
      "Syntactic Frameworks"
    ];
  }

  return [
    "Industrial Automation",
    "Post-War Frontiers",
    "Constitutional Systems"
  ];
};

  const topics = getTopicsForSubject();

  // Set default topic when subject changes
  useEffect(() => {
    if (topics.length > 0) {
      setTopic(topics[0]);
    }
  }, [subjectId, studentId]);

  // Filter quizzes for the selected student
  const filteredQuizzes = quizzes.filter(q => q.studentId === studentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || !topic) return;

    setIsGenerating(true);
    try {
      console.log("Current Student:", currentStudent);
      console.log("Grade:", currentStudent.grade);
      const response = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: currentStudent.board,
          grade: currentStudent.grade,
          subject: currentSubject.name,
          chapter: topic,
          difficulty: difficulty,
          questionsCount: questionsCount
        })
      });

      const data = await response.json();
      
      // Create a new task / quiz with the generated questions
      onAddQuiz({
        name: `${topic} Evaluation`,
        subject: currentSubject.name,
        date: new Date().toISOString().split('T')[0],
        questionsCount: Number(questionsCount),
        duration,
        studentId,
        questions: data.questions, // Save the dynamic AI questions!
        score: undefined // newly assigned task is pending / unscored
      });

      setSuccessBanner(`Successfully generated and assigned "${topic} Evaluation" quiz to ${currentStudent.name}!`);
      setTimeout(() => {
        setSuccessBanner('');
      }, 4500);

    } catch (err) {
      console.error("Failed to generate assessment", err);
      // Fallback
      onAddQuiz({
        name: `${topic} Evaluation`,
        subject: currentSubject.name,
        date: new Date().toISOString().split('T')[0],
        questionsCount: Number(questionsCount),
        duration,
        studentId,
        score: undefined
      });
      setSuccessBanner(`Assigned "${topic} Evaluation" using curriculum fallbacks.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clone recent quiz handler
  const handleCloneQuiz = (quiz: Quiz) => {
    setStudentId(quiz.studentId);
    // Find matching subject id
    const targetStudent = students.find(s => s.id === quiz.studentId);
    const sub = targetStudent?.subjects.find(s => s.name === quiz.subject);
    if (sub) {
      setSubjectId(sub.id);
    }
    setDuration(quiz.duration);
    setTopic(quiz.name.replace(' Evaluation', ''));
    setQuestionsCount(quiz.questionsCount);
    
    setSuccessBanner(`Cloned parameters from "${quiz.name}" into the creator form!`);
    setTimeout(() => {
      setSuccessBanner('');
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
          <span>Active Command</span>
          <span>•</span>
          <span>Evaluation Creator</span>
        </div>
        <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
          Assessments &amp; Task Generator
        </h1>
        <p className="text-xs text-slate-500 font-sans">
          Configure a custom high-fidelity quiz based on standard state curriculum milestones.
        </p>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex gap-3 items-center text-xs font-sans"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check size={16} />
          </div>
          <div>
            <span className="font-bold uppercase block text-[10px] tracking-wider text-emerald-600">Task Dispatched</span>
            <span>{successBanner}</span>
          </div>
        </motion.div>
      )}

      {/* Grid: Create Form (Left) & Syllabus / Analytics Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Creator Form */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-sans font-bold text-slate-900 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award size={16} className="text-orange-500" />
            <span>Create Quiz / Custom Assessment Task</span>
          </h2>          {isGenerating ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin flex items-center justify-center shadow-lg">
                  <Sparkles size={26} className="text-orange-500 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-sans font-bold text-base text-slate-800">AI Curriculum Generator Active</h3>
                <p className="text-slate-500 text-xs font-sans max-w-md leading-relaxed mx-auto">
                  Gemini is analyzing the <strong>{currentStudent.board} ({currentStudent.grade})</strong> curriculum framework for <strong>{currentSubject?.name}</strong>. Building <strong>{questionsCount} custom {difficulty.toLowerCase()}</strong> items for <strong>{topic}</strong>...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Select Child */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Select Child Profile
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name.toUpperCase()} • {s.grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Syllabus Subject Track
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    {currentStudent?.subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Topic */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Select Chapter Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    {topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Time Allocation / Limit
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    <option value="10m">10 Minutes (Express)</option>
                    <option value="15m">15 Minutes (Standard)</option>
                    <option value="20m">20 Minutes (Detailed)</option>
                    <option value="30m">30 Minutes (Deep Evaluation)</option>
                  </select>
                </div>

                {/* Questions Count */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Questions Count
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    value={questionsCount}
                    onChange={(e) => setQuestionsCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Syllabus Difficulty Tier
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    <option value="Easy">Easy (Conceptual Recall)</option>
                    <option value="Medium">Medium (Application Focus)</option>
                    <option value="Hard">Hard (Analytical Mastery)</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setDuration('15m');
                    setQuestionsCount(10);
                    setDifficulty('Medium');
                  }}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 font-sans font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Reset Params
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg shadow-orange-600/15 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles size={14} className="text-orange-200 animate-pulse" />
                  <span>GENERATE &amp; ASSIGN VIA GEMINI</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Dynamic Syllabus Metrics Coverage (Screen 6 right sidebar representation) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-sm text-orange-600 mb-4 pb-2 border-b border-slate-100">
              Syllabus Diagnostic Coverage
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block">SELECTED MODULE</span>
                <span className="font-sans font-semibold text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-block">
                  {currentSubject?.name || 'Mathematics'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-500">Syllabus Completion</span>
                  <span className="font-bold text-slate-800">
                    {currentSubject ? Math.round((currentSubject.completedChapters / currentSubject.chaptersCount) * 100) : 40}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${currentSubject ? (currentSubject.completedChapters / currentSubject.chaptersCount) * 100 : 40}%` }}
                  />
                </div>
                <span className="text-[10px] font-sans text-slate-400 block">
                  {currentSubject?.completedChapters || 2} of {currentSubject?.chaptersCount || 5} topics fully cleared by student.
                </span>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-500">Historical Average Mastery</span>
                  <span className="font-bold text-slate-800">{currentSubject?.score || 52}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                    Student's relative mastery in this subject is <strong>{currentSubject?.score || 52}%</strong>. Quiz accuracy across homework evaluations is average.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 bg-orange-50/50 p-4 rounded-xl text-[11px] text-orange-700 font-sans leading-relaxed flex gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>Dispatched quizzes appear inside their <strong>Student Space</strong> instantly for solving.</span>
          </div>
        </div>

      </div>

      {/* Recent Quizzes List History (Screen 6 representation) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans font-bold text-sm text-orange-600">
              Evaluations History &amp; Dispatched Tasks
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Review results, duplicate quiz parameters, or track pending quiz completions.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 uppercase">
            Viewing {filteredQuizzes.length} tasks for {currentStudent?.name || 'child'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                <th className="py-3 px-6 font-semibold">Evaluation Topic</th>
                <th className="py-3 px-6 font-semibold">Subject Track</th>
                <th className="py-3 px-6 font-semibold">Scheduled Date</th>
                <th className="py-3 px-6 font-semibold">Configured Limit</th>
                <th className="py-3 px-6 font-semibold">Mastery Grade</th>
                <th className="py-3 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
              {filteredQuizzes.map((quiz) => {
                const isPending = !quiz.score;
                return (
                  <tr key={quiz.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span>{quiz.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{quiz.subject}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {new Date(quiz.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">
                      {quiz.questionsCount} Qs • {quiz.duration}
                    </td>
                    <td className="py-4 px-6">
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-100/50 text-[10px]">
                          PENDING ACTION
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 text-sm">{quiz.score}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-semibold">Cleared</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleCloneQuiz(quiz)}
                        className="py-1 px-2.5 rounded bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 font-semibold text-[11px] border border-slate-200 hover:border-orange-100 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Copy size={11} />
                        <span>CLONE</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
