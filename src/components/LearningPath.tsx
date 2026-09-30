import React from 'react';
import { Student, Quiz } from '../types';
import { 
  Sparkles, 
  CheckCircle, 
  Lock, 
  MapPin, 
  Award, 
  BookOpen, 
  HelpCircle, 
  ArrowRight,
  Bookmark,
  Target
} from 'lucide-react';

interface LearningPathProps {
  student: Student;
  quizzes: Quiz[];
  onChangeTab: (tab: string) => void;
}

export default function LearningPath({ student, quizzes, onChangeTab }: LearningPathProps) {
  // Calculate dynamic stats
  const totalTopics = student.subjects.reduce((sum, s) => sum + s.chaptersCount, 0);
  const completedTopics = student.subjects.reduce((sum, s) => sum + s.completedChapters, 0);
  const avgMastery = Math.round(student.subjects.reduce((sum, s) => sum + s.score, 0) / (student.subjects.length || 1));
  
  const studentQuizzes = quizzes.filter(q => q.studentId === student.id);
  const assessmentsTaken = studentQuizzes.length;
  const assessmentMastery = assessmentsTaken > 0
    ? Math.round(
        studentQuizzes.reduce((acc, q) => {
          if (!q.score) return acc;
          const [correct, total] = q.score.split('/').map(Number);
          return acc + (correct / (total || 1) * 100);
        }, 0) / assessmentsTaken
      )
    : 82; // fallback defaults

  const derivedLearningGaps = studentQuizzes.flatMap((quiz) => quiz.evaluation?.learningGaps || quiz.learningGaps || []);
  const uniqueLearningGaps = Array.from(new Set(derivedLearningGaps)).slice(0, 3);

  // Growth recommendations tailored to child dynamically
  const getGrowthInsight = () => {
    if (uniqueLearningGaps.length > 0) {
      const focusAreas = uniqueLearningGaps.join(', ');
      return `Recent AI feedback highlights ${focusAreas}. Build the next study block around these growth areas to strengthen mastery quickly.`;
    }
    const lowestSubject = [...(student.subjects || [])].sort((a, b) => a.score - b.score)[0];
    if (lowestSubject) {
      return `${student.name} is demonstrating steady dedication. ${lowestSubject.name} (currently ${lowestSubject.score}%) represents the prime opportunity for score acceleration. Practice targeted micro-assessments to raise overall mastery above 85%.`;
    }
    return `${student.name} is showing consistent dedication across all curriculum tracks. Focus on weak sub-chapters in their curriculum explorer to maximize general average mastery.`;
  };

  // Student specific milestones derived dynamically from active subjects
  const getMilestones = () => {
    if (!student.subjects || student.subjects.length === 0) {
      return [
        { id: 1, title: 'Foundational Knowledge', subject: 'Core Curriculum', status: 'active', desc: 'Initialize lesson progression.' }
      ];
    }
    return student.subjects.slice(0, 4).map((sub, idx) => ({
      id: idx + 1,
      title: `${sub.name} Module ${sub.completedChapters + 1}`,
      subject: sub.name,
      status: idx === 0 ? 'active' : (sub.percentage >= 80 ? 'completed' : 'locked'),
      desc: `Curriculum milestone for ${sub.name}. Completed: ${sub.completedChapters}/${sub.chaptersCount} chapters (${sub.percentage}%).`
    }));
  };

  const milestones = getMilestones();

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
          <span>Telemetry Map</span>
          <span>•</span>
          <span>Active Track</span>
        </div>
        <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
          Learning Path &mdash; {student.name}
        </h1>
        <p className="text-xs text-slate-500 font-sans">
          Analyze real-time lesson status, growth trajectories, and milestones for college preparedness.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase block">
            Curriculum Tier
          </span>
          <span className="text-base font-sans font-bold text-slate-800 block mt-1">
            {student.id === 'elena-rostova' ? 'Class 7 Advanced' : `${student.grade} General`}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase block">
            Topics Completed
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-sans font-bold text-slate-800">{completedTopics}</span>
            <span className="text-xs text-slate-400 font-mono">/ {totalTopics}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase block">
            Average Mastery
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-sans font-bold text-slate-800">{avgMastery}%</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-sans font-semibold">
              Advanced
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase block">
            Assessments Taken
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-sans font-bold text-slate-800">{assessmentsTaken}</span>
            <span className="text-xs text-slate-400 font-mono">quizzes</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase block">
            Quiz Accuracy
          </span>
          <span className="text-lg font-sans font-bold text-slate-800 block mt-1">
            {assessmentMastery}%
          </span>
        </div>
      </div>

      {/* Growth Insight (Screen 1 style) */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 flex flex-col md:flex-row items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/15">
          <Sparkles size={18} />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-orange-700 block">
            Eduvia Growth Insight
          </span>
          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            {getGrowthInsight()}
          </p>
          {uniqueLearningGaps.length > 0 && (
            <ul className="mt-3 space-y-1">
              {uniqueLearningGaps.map((gap) => (
                <li key={gap} className="text-xs text-slate-700 font-sans flex items-start gap-2">
                  <CheckCircle size={12} className="text-orange-500 mt-0.5 shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recommended Path Forward Timeline (Screen 1 style) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-sans font-bold text-sm text-slate-900 flex items-center gap-2">
            <Target size={16} className="text-orange-500" />
            <span>Recommended Path Forward Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Suggested sequences to systematically unlock remaining credit structures.
          </p>
        </div>

        {/* Milestone Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {milestones.map((step, idx) => {
            const isActive = step.status === 'active';
            
            return (
              <div key={step.id} className="relative space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                {/* Connecting Line (Only for desktop screens and between steps) */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-7 left-[80%] right-[-40%] h-0.5 bg-slate-200 z-0" />
                )}

                <div className="flex items-center justify-between relative z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-sans font-semibold text-xs ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.id}
                  </div>

                  {isActive ? (
                    <button 
                      onClick={() => onChangeTab('assessments')}
                      className="text-[10px] bg-orange-100 text-orange-700 font-sans font-semibold px-2 py-1 rounded-full hover:bg-orange-200 transition-all cursor-pointer"
                    >
                      Unlock Task
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                      <Lock size={10} />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-orange-600 uppercase font-semibold block leading-none">
                    {step.subject}
                  </span>
                  <h4 className="font-sans font-bold text-xs text-slate-800 block">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Curriculum Mastery Breakdown Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-sans font-bold text-sm text-slate-900">
            Curriculum Mastery Breakdown
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Subject-by-subject mapping of progress indicators, completion ratios, and diagnostic scores.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                <th className="py-3 px-6 font-semibold">Subject Title</th>
                <th className="py-3 px-6 font-semibold">Track Progress</th>
                <th className="py-3 px-6 font-semibold">Status Label</th>
                <th className="py-3 px-6 font-semibold">Diagnostic Mastery Score</th>
                <th className="py-3 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
              {student.subjects.map((sub) => {
                const isCompleted = sub.status === 'Completed';
                
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Subject Name */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {sub.name}
                    </td>

                    {/* Progress Slider representation */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? 'bg-orange-600' : 'bg-orange-500'}`}
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-800">
                          {sub.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Status Label */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-orange-50/80 text-orange-700'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Score (Mastery Score) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <span className="font-sans font-bold text-slate-800 text-sm">
                          {sub.score}
                        </span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </td>

                    {/* Quick Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onChangeTab('curriculum')}
                        className="text-xs text-orange-600 hover:text-orange-400 font-semibold cursor-pointer"
                      >
                        Explore Topics
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
