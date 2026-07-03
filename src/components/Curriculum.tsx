import React, { useState } from 'react';
import { Student } from '../types';
import { 
  BookOpen, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  HelpCircle, 
  Compass, 
  Bookmark,
  Award
} from 'lucide-react';
import { CURRICULUM_DETAILS } from '../data';

interface CurriculumProps {
  student: Student;
}

export default function Curriculum({ student }: CurriculumProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  const handleToggleTopic = (topicName: string) => {
    setCheckedTopics(prev => ({ ...prev, [topicName]: !prev[topicName] }));
  };

  // Find the subject from the student's profile
  const selectedSubject = student.subjects.find(s => s.id === selectedSubjectId);
  const details = selectedSubjectId ? CURRICULUM_DETAILS[selectedSubjectId] : null;

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* HEADER SECTION */}
      {!selectedSubjectId ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
            <span>Syllabus Matrix</span>
            <span>•</span>
            <span>Academic Guidelines</span>
          </div>
          <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
            Academic Curriculum Explorer &mdash; {student.name}
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Explore standard board-level chapters, and track student completion ratios dynamically.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-orange-600 uppercase font-semibold">
              Curriculum Explorer / {student.name}
            </span>
            <h1 className="text-xl font-sans font-extrabold text-orange-600 tracking-tight">
              {selectedSubject?.name} Details
            </h1>
          </div>
        </div>
      )}

      {/* CURRICULUM MAIN VIEW CONTAINER */}
      {!selectedSubjectId ? (
        /* SUBJECT CARDS GRID (Screen 9 representation) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {student.subjects.map((sub) => {
            const percentage = Math.round((sub.completedChapters / sub.chaptersCount) * 100);
            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase">
                      Active track
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    Board-compliant state level curriculum. Tracks standard chapters and prerequisites.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                    <span className="text-slate-500">Chapters: {sub.completedChapters} / {sub.chaptersCount}</span>
                    <span className="font-bold text-slate-800">{percentage}%</span>
                  </div>
                  {/* Progress bar slider */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-orange-600 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-orange-600 group-hover:text-orange-500 transition-colors flex items-center gap-1 mt-2">
                    <span>Explore Chapters &amp; Topics</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SUBJECT CHAPTER DRILL-DOWN (Screen 9 detail representation) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chapter Outline Chapters Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="font-sans font-bold text-sm text-slate-900 mb-2">Subject Syllabus Overview</h2>
              <p className="text-xs text-slate-500 font-sans leading-relaxed mb-6">
                {details?.desc}
              </p>

              {/* Chapters & Topics Expanders */}
              <div className="space-y-6">
                {details?.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-xs font-mono font-bold tracking-wide text-orange-600 uppercase">
                      Section {idx + 1}: {sec.name}
                    </h3>

                    <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
                      {sec.topics.map((top, tIdx) => {
                        const isChecked = !!checkedTopics[top];
                        return (
                          <div 
                            key={tIdx} 
                            onClick={() => handleToggleTopic(top)}
                            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              {isChecked ? (
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                              ) : (
                                <Circle size={16} className="text-slate-300 hover:text-orange-400 shrink-0" />
                              )}
                              <span className={`text-xs font-sans ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {top}
                              </span>
                            </div>

                            <span className={`text-[10px] font-mono uppercase font-semibold rounded px-2 py-0.5 ${
                              isChecked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isChecked ? 'Verifying' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Right Block */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="font-sans font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Mastery Calibration
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Diagnostics Grade</span>
                  <span className="text-3xl font-sans font-extrabold text-slate-800 block mt-1.5">
                    {selectedSubject?.score} / 100
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans block mt-1 leading-relaxed">
                    Student scored well in previous exams. Quiz evaluations show robust knowledge.
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Curriculum Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-semibold text-slate-700">Completion tier:</span>
                    <span className="text-xs font-sans font-bold text-orange-600">
                      {selectedSubject?.completedChapters} of {selectedSubject?.chaptersCount} chapters
                    </span>
                  </div>
                </div>

                <div className="pt-2 bg-orange-50/50 p-4 rounded-xl text-[11px] text-orange-700 leading-relaxed font-sans flex gap-2">
                  <Compass size={16} className="shrink-0 text-orange-600 mt-0.5" />
                  <span>Use parent checks to manually flag chapters verified during at-home homework reviews.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
