import React from 'react';
import { motion } from 'motion/react';
import { Student } from '../types';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Award, 
  Map, 
  CalendarDays, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Plus, 
  ChevronDown, 
  User, 
  GraduationCap 
} from 'lucide-react';

interface SidebarProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onAddChildClick: () => void;
  onLogout: () => void;
  parentName: string;
}

export default function Sidebar({
  students,
  selectedStudentId,
  onSelectStudent,
  activeTab,
  onChangeTab,
  onAddChildClick,
  onLogout,
  parentName
}: SidebarProps) {
  const currentStudent = students.find(s => s.id === selectedStudentId);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learning-path', label: 'Learning Path', icon: Map },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'support', label: 'Support Center', icon: HelpCircle },
    { id: 'settings', label: 'Portal Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white text-slate-900 flex flex-col h-screen border-r border-slate-200 shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center font-sans font-extrabold text-sm text-white shadow-sm">
            E
          </div>
          <div>
            <span className="font-sans font-bold text-lg tracking-tight text-slate-900 block">eduvia</span>
            <span className="text-[10px] text-orange-600 font-mono tracking-wider uppercase block font-semibold">Academy Portal</span>
          </div>
        </div>
      </div>

      {/* Student Focus Switcher */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <label className="block text-[10px] font-mono text-slate-500 tracking-wider uppercase mb-2">
          Student Focus Selector
        </label>
        
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
          {students.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/15' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${student.avatarColor} text-white flex items-center justify-center text-xs font-bold font-mono`}>
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans font-semibold text-xs block truncate leading-tight">
                    {student.name}
                  </span>
                  <span className={`text-[10px] block truncate ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                    {student.grade} • {student.board}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onAddChildClick}
          className="mt-3 w-full py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-sans font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-orange-200"
        >
          <Plus size={14} />
          <span>Add student profile</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              whileHover={{ x: 3, backgroundColor: isActive ? "#fff7ed" : "#f8fafc" }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans font-medium text-xs transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 border-l-2 border-orange-600 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-orange-600' : 'text-slate-400'} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* User Info & Switch Roles */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-sans font-semibold text-xs block text-slate-800 truncate">
              {parentName}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              Command Access Role
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2 px-3 bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 font-sans font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-transparent hover:border-orange-200"
        >
          <LogOut size={14} />
          <span>Switch Personas</span>
        </button>
      </div>
    </aside>
  );
}
