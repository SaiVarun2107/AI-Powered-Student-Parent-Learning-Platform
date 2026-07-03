import React, { useState } from 'react';
import { Student, Quiz } from '../types';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Check, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Globe, 
  Compass, 
  Info,
  Sliders,
  CalendarDays
} from 'lucide-react';

interface AnalyticsProps {
  student: Student;
  quizzes: Quiz[];
  onChangeTab: (tab: string) => void;
}

interface ChartPoint {
  label: string;
  score: number;
}

export default function Analytics({ student, quizzes, onChangeTab }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'6m' | 'ytd' | 'all'>('6m');
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [actionPlanState, setActionPlanState] = useState<Record<string, boolean>>({});

  const evaluationQuizzes = quizzes
    .filter((quiz) => quiz.studentId === student.id && (quiz.evaluation?.percentage !== undefined || typeof quiz.percentage === 'number'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getChartData = (): ChartPoint[] => {
    const source = evaluationQuizzes.slice(0, 6).reverse();
    if (source.length > 0) {
      return source.map((quiz) => ({
        label: quiz.name,
        score: quiz.evaluation?.percentage ?? quiz.percentage ?? 0
      }));
    }

    if (timeRange === '6m') {
      return [
        { label: 'May 2024', score: 76 },
        { label: 'Jun 2024', score: 79 },
        { label: 'Jul 2024', score: 82 },
        { label: 'Aug 2024', score: 80 },
        { label: 'Sep 2024', score: 85 },
        { label: 'Oct 2024', score: 88 }
      ];
    }
    if (timeRange === 'ytd') {
      return [
        { label: 'Jan 2024', score: 72 },
        { label: 'Feb 2024', score: 74 },
        { label: 'Mar 2024', score: 75 },
        { label: 'Apr 2024', score: 78 },
        { label: 'May 2024', score: 76 },
        { label: 'Jun 2024', score: 79 },
        { label: 'Jul 2024', score: 82 },
        { label: 'Aug 2024', score: 80 },
        { label: 'Sep 2024', score: 85 },
        { label: 'Oct 2024', score: 88 }
      ];
    }
    return [
      { label: 'Sep 2023', score: 65 },
      { label: 'Nov 2023', score: 68 },
      { label: 'Jan 2024', score: 72 },
      { label: 'Mar 2024', score: 75 },
      { label: 'May 2024', score: 76 },
      { label: 'Jul 2024', score: 82 },
      { label: 'Sep 2024', score: 85 },
      { label: 'Oct 2024', score: 88 }
    ];
  };

  const data = getChartData();

  // SVG dimensions for the responsive trend graph
  const width = 600;
  const height = 220;
  const padding = 40;

  // Compute SVG Points
  const minX = padding;
  const maxX = width - padding;
  const minY = height - padding;
  const maxY = padding;

  const scoreMin = 50;
  const scoreMax = 100;

  const points = data.map((point, index) => {
    const x = minX + (index / (data.length - 1)) * (maxX - minX);
    const y = minY - ((point.score - scoreMin) / (scoreMax - scoreMin)) * (minY - maxY);
    return { x, y, ...point };
  });

  // SVG Path description line
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  // Area under path
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${minY} L ${points[0].x} ${minY} Z`
    : '';

  const handleActionClick = (planId: string) => {
    setActionPlanState(prev => ({ ...prev, [planId]: !prev[planId] }));
  };

  const subjectAverages = student.subjects.map((subject) => ({
    name: subject.name,
    score: Math.round((evaluationQuizzes.filter((quiz) => quiz.subject === subject.name).reduce((sum, quiz) => sum + (quiz.percentage || 0), 0) / Math.max(1, evaluationQuizzes.filter((quiz) => quiz.subject === subject.name).length)) || subject.score)
  }));

  const strongestSubjects = [...subjectAverages].sort((a, b) => b.score - a.score).slice(0, 3);
  const weakestSubjects = [...subjectAverages].sort((a, b) => a.score - b.score).slice(0, 3);
  const conceptMastery = Math.round(subjectAverages.reduce((sum, item) => sum + item.score, 0) / Math.max(1, subjectAverages.length));
  const accuracy = evaluationQuizzes.length > 0
    ? Math.round(evaluationQuizzes.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0) / evaluationQuizzes.length)
    : Math.round(student.subjects.reduce((sum, item) => sum + item.score, 0) / Math.max(1, student.subjects.length));
  const gapFrequency = evaluationQuizzes.reduce((counts, quiz) => {
    (quiz.evaluation?.learningGaps || quiz.learningGaps || []).forEach((gap) => {
      counts[gap] = (counts[gap] || 0) + 1;
    });
    return counts;
  }, {} as Record<string, number>);
  const topGap = Object.entries(gapFrequency).sort((a, b) => b[1] - a[1])[0];

  // Student specific mastery trends (Screen 7 sidebar)
  const getSubjectMasteryTrends = () => {
    if (student.id === 'elena-rostova') {
      return [
        { name: 'Advanced Algebra', score: 94, trend: 'up', color: 'text-orange-600 bg-orange-50 border-orange-100' },
        { name: 'Biological Systems', score: 82, trend: 'down', color: 'text-orange-600 bg-orange-50 border-orange-100' },
        { name: 'Literature Analysis', score: 88, trend: 'up', color: 'text-orange-600 bg-orange-50 border-orange-100' },
        { name: 'World History', score: 91, trend: 'flat', color: 'text-orange-600 bg-orange-50 border-orange-100' }
      ];
    }
    return subjectAverages.map((item) => ({
      name: item.name,
      score: item.score,
      trend: item.score >= 85 ? 'up' : item.score >= 70 ? 'flat' : 'down',
      color: 'text-orange-600 bg-orange-50 border-orange-100'
    }));
  };

  const trends = getSubjectMasteryTrends();

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
            <span>Diagnostics Telemetry</span>
            <span>•</span>
            <span>Analytics Engine</span>
          </div>
          <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
            Academic Analytics Overview &mdash; {student.name}
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Consolidated insights regarding learning retention trajectories and curriculum mastery gains.
          </p>
        </div>

        {/* Time-range switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setTimeRange('6m'); setHoveredIndex(null); }}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-sans font-semibold cursor-pointer transition-all ${
              timeRange === '6m' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            6 MONTHS
          </button>
          <button
            onClick={() => { setTimeRange('ytd'); setHoveredIndex(null); }}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-sans font-semibold cursor-pointer transition-all ${
              timeRange === 'ytd' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            YEAR-TO-DATE
          </button>
          <button
            onClick={() => { setTimeRange('all'); setHoveredIndex(null); }}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-sans font-semibold cursor-pointer transition-all ${
              timeRange === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ALL TIME
          </button>
        </div>
      </div>

      {/* Main Trend Chart and Subject Mastery Row (Screen 7 representation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LINE CHART GRAPH */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
            <h3 className="font-sans font-bold text-sm text-orange-600 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              <span>Performance Growth Trend</span>
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold font-sans bg-emerald-50 px-2 py-0.5 rounded">
              <ArrowUpRight size={14} />
              <span>+12.4% Over Prev. Period</span>
            </div>
          </div>

          {/* Interactive SVG Chart wrapper */}
          <div className="relative pt-2">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[50, 60, 70, 80, 90, 100].map((scoreValue) => {
                const yPos = minY - ((scoreValue - scoreMin) / (scoreMax - scoreMin)) * (minY - maxY);
                return (
                  <g key={scoreValue}>
                    <line 
                      x1={minX} 
                      y1={yPos} 
                      x2={maxX} 
                      y2={yPos} 
                      stroke="#f1f5f9" 
                      strokeWidth={1} 
                    />
                    <text 
                      x={minX - 10} 
                      y={yPos + 4} 
                      textAnchor="end" 
                      fill="#94a3b8" 
                      className="font-mono text-[9px] font-bold"
                    >
                      {scoreValue}%
                    </text>
                  </g>
                );
              })}

              {/* Area path */}
              <path 
                d={areaPath} 
                fill="url(#chartGrad)" 
                opacity={0.12} 
              />

              {/* Line path */}
              <path 
                d={linePath} 
                fill="none" 
                stroke="#f97316" 
                strokeWidth={2.5} 
                strokeLinecap="round" 
              />

              {/* Data points */}
              {points.map((p, index) => {
                const isHovered = hoveredIndex === index;
                return (
                  <g key={index}>
                    {/* Invisible hover-trigger bounds */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={18}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => {
                        setHoveredPoint(p);
                        setHoveredIndex(index);
                      }}
                      onMouseLeave={() => {
                        setHoveredPoint(null);
                        setHoveredIndex(null);
                      }}
                    />

                    {/* Visible outer circle marker on focus */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 7 : 4}
                      fill="#ffffff"
                      stroke="#f97316"
                      strokeWidth={isHovered ? 3 : 2}
                      className="pointer-events-none transition-all duration-150"
                    />
                  </g>
                );
              })}

              {/* Horizontal / Vertical crosshairs */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={minY}
                  x2={hoveredPoint.x}
                  y2={maxY}
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  className="pointer-events-none"
                />
              )}

              {/* Gradients */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover Tooltip Overlay (Calculated visually) */}
            {hoveredPoint && (
              <div 
                className="absolute z-10 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl border border-slate-800 text-center pointer-events-none transition-all"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  transform: 'translateX(-50%)',
                  top: `${(hoveredPoint.y / height) * 100 - 35}%`,
                  marginTop: '-35px'
                }}
              >
                <span className="text-[10px] font-mono text-orange-400 block uppercase leading-none">
                  {hoveredPoint.label}
                </span>
                <span className="font-sans font-bold text-xs mt-1 block leading-none">
                  Avg Score: {hoveredPoint.score}%
                </span>
              </div>
            )}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-[40px] pt-1 text-[10px] text-slate-400 font-mono">
            {data.map((item, i) => (
              <span key={i}>{item.label.split(' ')[0]}</span>
            ))}
          </div>
        </div>

        {/* SUBJECT MASTERY PROGRESS */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="font-sans font-bold text-sm text-orange-600 mb-5 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Sliders size={16} className="text-orange-500" />
            <span>Subject Mastery Matrix</span>
          </h3>

          <div className="space-y-4">
            {trends.map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-sans font-bold text-xs text-slate-800 block">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
                    <span>Diagnostic Mastery:</span>
                    <span className="font-bold text-slate-700">{t.score}%</span>
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono ${t.color}`}>
                  {t.trend === 'up' && <ArrowUpRight size={16} />}
                  {t.trend === 'down' && <ArrowDownRight size={16} />}
                  {t.trend === 'flat' && <Minus size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Strongest Subjects</p>
          <p className="mt-2 text-sm font-sans font-semibold text-slate-800">{strongestSubjects[0]?.name || '—'}</p>
          <p className="text-xs text-slate-500">{strongestSubjects[0]?.score || 0}% mastery</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Weakest Subjects</p>
          <p className="mt-2 text-sm font-sans font-semibold text-slate-800">{weakestSubjects[0]?.name || '—'}</p>
          <p className="text-xs text-slate-500">{weakestSubjects[0]?.score || 0}% mastery</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Concept Mastery</p>
          <p className="mt-2 text-sm font-sans font-semibold text-slate-800">{conceptMastery}%</p>
          <p className="text-xs text-slate-500">Across active subject tracks</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Accuracy</p>
          <p className="mt-2 text-sm font-sans font-semibold text-slate-800">{accuracy}%</p>
          <p className="text-xs text-slate-500">Average from completed evaluations</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Learning Gap Frequency</p>
          <p className="mt-2 text-sm font-sans font-semibold text-slate-800">{topGap ? topGap[0] : '—'}</p>
          <p className="text-xs text-slate-500">{topGap ? `${topGap[1]} mentions` : 'No gaps logged yet'}</p>
        </div>
      </div>

      {/* Recommended Action Plan (Screen 7 bento layout) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-sans font-bold text-sm text-orange-600">
            Recommended Action Plan
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Personalized remedial routes formulated by system evaluations to address conceptual weak spots.
          </p>
        </div>

        {/* Bento Plan Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action Item 1 */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  MATH REMEDIAL
                </span>
                <span className="text-xs text-slate-400 font-sans">Priority: High</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-800">
                1. {strongestSubjects[0]?.name || 'Revisit the strongest concept'}
              </h4>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                {student.name}'s latest evaluations show the strongest momentum in {strongestSubjects[0]?.name || 'core revision'} with {accuracy}% overall accuracy.
              </p>
            </div>
            
            <button
              onClick={() => {
                if (actionPlanState['p1']) return;
                onChangeTab('curriculum');
              }}
              className={`w-full mt-4 py-2 text-center rounded-xl font-sans font-semibold text-xs border cursor-pointer transition-all ${
                actionPlanState['p1'] 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-500/30'
              }`}
            >
              <span>{actionPlanState['p1'] ? 'Module Opened' : 'Open Module'}</span>
            </button>
          </div>

          {/* Action Item 2 */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  SCIENCE DRILL
                </span>
                <span className="text-xs text-slate-400 font-sans">Priority: Medium</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-800">
                2. {weakestSubjects[0]?.name || 'Address the current gap'}
              </h4>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                Focus on {weakestSubjects[0]?.name || 'the weakest topic'} first, since it currently carries the lowest observed mastery at {weakestSubjects[0]?.score || 0}%.
              </p>
            </div>

            <button
              onClick={() => {
                if (actionPlanState['p2']) return;
                onChangeTab('assessments');
              }}
              className={`w-full mt-4 py-2 text-center rounded-xl font-sans font-semibold text-xs border cursor-pointer transition-all ${
                actionPlanState['p2'] 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-500/30'
              }`}
            >
              <span>{actionPlanState['p2'] ? 'Quizzes Generated' : 'Start Practice'}</span>
            </button>
          </div>

          {/* Action Item 3 */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  ADVISORY SERVICE
                </span>
                <span className="text-xs text-slate-400 font-sans">Priority: Optional</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-800">
                3. Review the next learning step
              </h4>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                {topGap ? `Prioritize ${topGap[0]} next, since it appeared ${topGap[1]} times across recent evaluations.` : 'Use the latest AI recommendation to anchor the next revision cycle.'}
              </p>
            </div>

            <button
              onClick={() => handleActionClick('p3')}
              className={`w-full mt-4 py-2 text-center rounded-xl font-sans font-semibold text-xs border cursor-pointer transition-all ${
                actionPlanState['p3'] 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-500/30'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                {actionPlanState['p3'] && <Check size={12} />}
                <span>{actionPlanState['p3'] ? 'Session Requested' : 'Book Now'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Stats Row (Screen 7 footer) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-slate-500 font-sans text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Weekly Study Time</span>
            <span className="font-bold text-slate-800 text-sm">18.5 Hours Average</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Check size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Portal Evaluations</span>
            <span className="font-bold text-slate-800 text-sm">42 Completed / 50</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Globe size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Global Percentile rank</span>
            <span className="font-bold text-slate-800 text-sm">Top 15% Statewide</span>
          </div>
        </div>
      </div>

    </div>
  );
}
