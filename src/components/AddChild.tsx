import React, { useState } from 'react';
import { Student } from '../types';
import { 
  UserPlus, 
  ArrowLeft, 
  Check, 
  GraduationCap, 
  Building, 
  CalendarDays, 
  Mail, 
  Bookmark,
  Sparkles
} from 'lucide-react';

interface AddChildProps {
  onBack: () => void;
  onAddStudent: (student: Student) => void;
}

export default function AddChild({ onBack, onAddStudent }: AddChildProps) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('Class 10');
  const [board, setBoard] = useState('State Board');
  const [yearFrom, setYearFrom] = useState('2024');
  const [yearTo, setYearTo] = useState('2025');
  const [email, setEmail] = useState('');

  // Local Success message banner
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !school || !email) return;

    // Pick a cute colorful gradient for the avatar
    const avatars = [
      'from-emerald-500 to-teal-600',
      'from-indigo-500 to-purple-600',
      'from-orange-500 to-amber-600',
      'from-pink-500 to-rose-600',
      'from-sky-500 to-blue-600'
    ];
    const pickedAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name,
      grade,
      school,
      board,
      academicYearFrom: yearFrom,
      academicYearTo: yearTo,
      email,
      avatarColor: pickedAvatar,
      subjects: [
        { id: 'math', name: 'Mathematics', chaptersCount: 12, completedChapters: 0, percentage: 0, score: 0, status: 'In Progress' },
        { id: 'science', name: 'General Science', chaptersCount: 10, completedChapters: 0, percentage: 0, score: 0, status: 'In Progress' },
        { id: 'lit', name: 'English Literature', chaptersCount: 15, completedChapters: 0, percentage: 0, score: 0, status: 'In Progress' },
        { id: 'history', name: 'History & Civics', chaptersCount: 8, completedChapters: 0, percentage: 0, score: 0, status: 'In Progress' }
      ]
    };

    setSuccess(true);
    setTimeout(() => {
      onAddStudent(newStudent);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-2xl mx-auto w-full">
      
      {/* Header back navigation Row */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-orange-600 uppercase font-semibold">
            Student Configuration
          </span>
          <h1 className="text-xl font-sans font-extrabold text-slate-900 tracking-tight">
            Add New Child Profile
          </h1>
        </div>
      </div>

      {success ? (
        /* Dynamic Success splash */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-xl py-12 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <Check size={28} />
          </div>
          <h2 className="text-lg font-sans font-bold text-slate-900">Registration Dispatched!</h2>
          <p className="text-slate-500 text-xs font-sans max-w-sm">
            {name}'s student credentials have been written into the academic node database. Syncing dashboard...
          </p>
        </div>
      ) : (
        /* Add Child Form (Screen 2 representation) */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-sm font-sans font-bold text-slate-900 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserPlus size={16} className="text-orange-500" />
            <span>Student Registration Profile Form</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                Child's Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Julian Stark"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* School or College name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                School or College Name
              </label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Eduvia Academy Senior High"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
              />
            </div>

            {/* Row: Grade & Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Grade Level Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                  Current Grade Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none cursor-pointer"
                >
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>

              {/* Education Board Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                  Education Board / Tier
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none cursor-pointer"
                >
                  <option value="State Board">State Board (Standard)</option>
                  <option value="State Board (Advanced)">State Board (Advanced)</option>
                  <option value="International Board">International Board (IB)</option>
                  <option value="National CBSE">National CBSE / ICSE</option>
                </select>
              </div>
            </div>

            {/* Row: Academic Year From and To */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                  Academic Year (From)
                </label>
                <input
                  type="number"
                  required
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                  Academic Year (To)
                </label>
                <input
                  type="number"
                  required
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Student Board Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                Child's School Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="child.name@student.eduvia.org"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
              />
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onBack}
                className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 font-sans font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg shadow-orange-600/15 cursor-pointer transition-all"
              >
                + ADD NEW CHILD
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
