import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Student, Quiz, CalendarEvent } from '../types';
import { 
  Search, 
  Plus, 
  Award, 
  Layers, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  UserCheck,
  MapPin,
  ClipboardList,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  quizzes: Quiz[];
  events: CalendarEvent[];
  parentName: string;
  onSelectStudent: (id: string) => void;
  onChangeTab: (tab: string) => void;
  onAddStudentClick: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function Dashboard({
  students,
  quizzes,
  events,
  parentName,
  onSelectStudent,
  onChangeTab,
  onAddStudentClick,
  onEditStudent,
  onDeleteStudent
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const hasStudents = students.length > 0;

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.board.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute stats across all registered children for current parent
  const totalSubjectsCount = students.reduce((acc, student) => acc + student.subjects.length, 0);
  const avgCompletionPercentage = Math.round(
    students.reduce((acc, student) => {
      const studentAvg = student.subjects.reduce((sum, subj) => sum + subj.percentage, 0) / (student.subjects.length || 1);
      return acc + studentAvg;
    }, 0) / (students.length || 1)
  );
  
  const totalCompletedQuizzes = quizzes.filter(q => q.score).length;
  const latestEvaluationQuiz = [...quizzes]
    .filter(q => q.evaluation || (q.score && typeof q.percentage === 'number'))
    .sort((a, b) => new Date(b.evaluationTimestamp || b.date).getTime() - new Date(a.evaluationTimestamp || a.date).getTime())[0];
  const latestEvaluation = latestEvaluationQuiz?.evaluation ?? null;
  const reportScoreLabel = latestEvaluation
    ? `${latestEvaluation.score}/${latestEvaluation.total}`
    : latestEvaluationQuiz?.score || '—';
  const reportPercentageLabel = latestEvaluation
    ? `${latestEvaluation.percentage}%`
    : latestEvaluationQuiz?.percentage !== undefined
      ? `${latestEvaluationQuiz.percentage}%`
      : '—';
  const formatEvaluationTimestamp = (value?: string) => {
    if (!value) return 'Not available';
    return new Date(value).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Upcoming assessments for any of the children
  const upcomingStudentEvents = events.filter(e => e.studentId && (e.type === 'assessment' || e.type === 'exam'));

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto w-full">
      {/* Welcome Banner Row */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-orange-500/20"
      >
        <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="z-10">
          <div className="text-xs font-mono text-orange-100 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Eduvia Hub Core Online</span>
          </div>
          <h1 className="text-3xl font-sans font-extrabold tracking-tight">
            Hello, {parentName.split(' ')[0].toUpperCase()}
          </h1>
          <p className="text-orange-100 text-sm mt-1.5 font-sans font-light max-w-xl">
            Welcome back to the Parental Command Station. Monitor chapter accomplishments, schedule targeted quizzes, and direct active learning paths.
          </p>
        </div>
        <div className="shrink-0 z-10 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddStudentClick}
            className="px-5 py-3 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-sans font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-black/10"
          >
            <Plus size={16} />
            <span>Add Student Profile</span>
          </motion.button>
        </div>
      </motion.div>

      {hasStudents ? (
        <>
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Metric 1: Avg Completion */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase block">
                  Total Average Progress
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-sans font-extrabold text-slate-900">
                    {avgCompletionPercentage || 0}%
                  </span>
                  <span className="text-xs font-sans text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    +4.2%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${avgCompletionPercentage}%` }}
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" 
                  />
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp size={22} />
              </div>
            </motion.div>

            {/* Metric 2: Active Subject Modules */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase block">
                  Active Subject Modules
                </span>
                <div className="text-3xl font-sans font-extrabold text-slate-900">
                  {totalSubjectsCount}
                </div>
                <span className="text-[11px] font-sans text-slate-400 block">
                  Configured across all profiles
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen size={22} />
              </div>
            </motion.div>

            {/* Metric 3: Completed Quizzes */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group cursor-default"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase block">
                  Evaluations Taken
                </span>
                <div className="text-3xl font-sans font-extrabold text-slate-900">
                  {totalCompletedQuizzes}
                </div>
                <span className="text-[11px] font-sans text-slate-400 block">
                  Graded and logged in portal
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award size={22} />
              </div>
            </motion.div>
          </div>

          {(latestEvaluationQuiz || quizzes.length > 0) && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-sans font-extrabold text-orange-600">Latest AI Report Card</h2>
              <p className="text-xs text-slate-500 font-sans">{latestEvaluationQuiz?.name || 'No completed quiz yet'} • {latestEvaluationQuiz?.subject || 'Awaiting evaluation'}</p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-orange-700">
              {latestEvaluation?.overallPerformance || latestEvaluationQuiz?.overallPerformance || 'Pending'}
            </span>
          </div>

          {!latestEvaluation ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm font-sans font-semibold text-slate-700">No AI evaluation available yet.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm font-sans font-semibold text-slate-900">
                  <span>Overall Score</span>
                  <span>{reportScoreLabel} ({reportPercentageLabel})</span>
                </div>
                <div className="mt-3 text-xs leading-relaxed text-slate-600">
                  <p className="font-semibold text-slate-900">Overall Performance</p>
                  <p className="mt-1">{latestEvaluation.overallPerformance}</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{latestEvaluation.summary}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-sans font-semibold text-slate-900">Strengths</h3>
                <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-slate-600 space-y-1">
                  {latestEvaluation.strengths?.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-sans font-semibold text-slate-900">Learning Gaps</h3>
                <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-slate-600 space-y-1">
                  {latestEvaluation.learningGaps?.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-sans font-semibold text-slate-900">Question-wise Mistakes</h3>
                <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-slate-600 space-y-1">
                  {latestEvaluation.mistakes?.length ? latestEvaluation.mistakes.map((item) => (
                    <li key={`${item.question}-${item.reason}`}>Q{item.question}: {item.reason}</li>
                  )) : <li>No mistakes recorded.</li>}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-sans font-semibold text-slate-900">Recommendations</h3>
                <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-slate-600 space-y-1">
                  {latestEvaluation.recommendations?.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-900">Confidence Level:</span> {latestEvaluation.confidence}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Evaluation Time:</span> {formatEvaluationTimestamp(latestEvaluation.evaluationTimestamp)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-sans font-extrabold text-orange-600">No children added yet</h2>
              <p className="text-sm text-slate-500 font-sans mt-1">
                Add your first child profile to start tracking progress, assessments, and learning milestones.
              </p>
            </div>
            <button
              onClick={onAddStudentClick}
              className="py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-orange-600/10"
            >
              <Plus size={15} />
              <span>Add Student Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Columns: Children Focus List (Left) & Upcoming + Tip (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Children search and list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-lg font-sans font-extrabold text-orange-600">My Children</h2>
              <p className="text-xs text-slate-500 font-sans">
                Review and direct specific child profiles. Click assign task to generate quizzes.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={15} />
              </div>
              <input 
                type="text"
                placeholder="Search child or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Children List */}
          {filteredStudents.length > 0 ? (
            <div className="space-y-5">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Student Title Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${student.avatarColor} text-white flex items-center justify-center font-sans font-bold text-base shadow-sm`}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-sans font-bold text-base text-slate-900 leading-tight">
                          {student.name.toUpperCase()}
                        </h3>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">
                          {student.grade} • {student.board} • Board Email: {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 items-center">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-slate-200 hover:border-orange-100 cursor-pointer animate-pulse"
                        title="Edit Child Profile"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingStudentId(student.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-100 cursor-pointer"
                        title="Delete Child Profile"
                      >
                        <Trash2 size={13} />
                      </button>

                      <button
                        onClick={() => {
                          onSelectStudent(student.id);
                          onChangeTab('assessments');
                        }}
                        className="py-2 px-3 bg-white hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-sans font-semibold text-xs rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus size={13} />
                        <span>ASSIGN TASK</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectStudent(student.id);
                          onChangeTab('learning-path');
                        }}
                        className="py-2 px-3.5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-orange-600/10 flex items-center gap-1.5"
                      >
                        <span>VIEW REPORT</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Subject Progress Tracks */}
                  <div className="mt-5 space-y-4">
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase block">
                      Curriculum Tracks Performance
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {student.subjects.map((subject) => (
                        <div key={subject.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-sans">
                            <span className="font-medium text-slate-700">{subject.name}</span>
                            <span className="font-bold text-slate-900">{subject.percentage}%</span>
                          </div>
                          
                          {/* Progress slider track */}
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-orange-500 transition-all duration-1000"
                              style={{ width: `${subject.percentage}%` }}
                            />
                          </div>
                          
                          {/* Subject small summary */}
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Chapters: {subject.completedChapters}/{subject.chaptersCount}</span>
                            <span>Avg Mastery: {subject.score}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-sm py-12">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <ClipboardList size={32} />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 mb-2">
                {students.length === 0 ? 'No children added yet' : 'No profiles match parameters'}
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 font-sans">
                {students.length === 0
                  ? 'Start by adding your first child profile to monitor their progress and upcoming assessments.'
                  : `No children matched your search filter "${searchTerm}". Make sure you spelled the name correctly or add a brand new child's profile to track their progress.`}
              </p>
              <button
                onClick={onAddStudentClick}
                className="py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-orange-600/10"
              >
                <Plus size={15} />
                <span>{students.length === 0 ? '+ ADD YOUR FIRST CHILD' : '+ ADD NEW CHILD'}</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Upcoming exams & tip focus */}
        <div className="lg:col-span-4 space-y-6">
          {hasStudents && upcomingStudentEvents.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-sans font-extrabold text-sm text-orange-600 flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  <span>Upcoming Exams &amp; Assessments</span>
                </h3>
              </div>

              <div className="space-y-3.5">
                {upcomingStudentEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 font-sans font-bold text-xs">
                      {event.type === 'exam' ? 'EX' : 'AS'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-sans font-bold text-xs text-slate-800 block truncate">
                        {event.title}
                      </span>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                        <span>For: {event.studentName}</span>
                        <span>Date: {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => onChangeTab('calendar')}
                  className="w-full py-2.5 text-center bg-orange-50 hover:bg-orange-100 font-sans font-semibold text-xs text-orange-600 hover:text-orange-500 rounded-xl transition-all border border-orange-200 cursor-pointer"
                >
                  View Full Academic Calendar
                </button>
              </div>
            </div>
          )}

          {/* Parental Tip Focus Widget */}
          <div className="bg-orange-600 text-orange-50 rounded-2xl p-6 shadow-md border border-orange-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center shadow-inner">
                <Lightbulb size={16} />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                Parental Tip Focus
              </span>
            </div>

            <h4 className="font-sans font-extrabold text-xs text-white mb-1.5">
              Support Active Recall Learning
            </h4>
            <p className="text-[11px] text-orange-100 font-sans leading-relaxed">
              Research shows testing material is up to 3x more effective than passive re-reading. Assign mini quizzes via the 'Assessments' screen to evaluate subject retention after each weekend lesson.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-mono">
        <span>EDU-ACADEMY PORTAL CONSOLE V2.4</span>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-slate-600">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-600">Terms of Service</a>
          <button onClick={() => onChangeTab('support')} className="hover:text-slate-600 text-left">Support Center</button>
        </div>
      </footer>

      {/* Edit Child Modal Overlay */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-sans font-extrabold text-sm text-slate-800">Edit Child Profile</h3>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingStudent) {
                onEditStudent(editingStudent);
                setEditingStudent(null);
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">Child's Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">School/College Name</label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.school || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, school: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">Grade Level</label>
                  <select
                    value={editingStudent.grade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none cursor-pointer text-slate-800"
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">Curriculum Board</label>
                  <select
                    value={editingStudent.board}
                    onChange={(e) => setEditingStudent({ ...editingStudent, board: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs outline-none cursor-pointer text-slate-800"
                  >
                    <option value="State Board">State Board</option>
                    <option value="CBSE Track">CBSE Track</option>
                    <option value="ICSE Track">ICSE Track</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">Board Email Address</label>
                <input 
                  type="email" 
                  required
                  value={editingStudent.email || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-sans font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Child Modal Overlay */}
      {deletingStudentId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto animate-pulse">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans font-extrabold text-base text-slate-800">Delete Student Profile?</h3>
              <p className="text-slate-500 text-xs font-sans">
                This action is irreversible. All progress charts, exam calendars, and assessment logs for this child will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingStudentId(null)}
                className="flex-1 py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-sans font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(deletingStudentId);
                  setDeletingStudentId(null);
                }}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-sans font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
