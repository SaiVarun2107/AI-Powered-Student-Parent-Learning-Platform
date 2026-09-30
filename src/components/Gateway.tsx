import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, Users, Sliders } from 'lucide-react';

interface GatewayProps {
  onSelectRole: (role: 'parent' | 'student' | 'teacher' | 'admin') => void;
}

// Framer motion variants for staggered lists
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 14
    }
  }
};

export default function Gateway({ onSelectRole }: GatewayProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Animated Background Decorative Rings & Floating Glows */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
          opacity: [0.7, 0.9, 0.7]
        }}
        transition={{ 
          duration: 9, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          scale: [1, 0.92, 1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{ 
          duration: 11, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none" 
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-70 pointer-events-none" />

      <div className="max-w-4xl w-full z-10 text-center">
        {/* Logo Header with Spring Entrance & Hover effect */}
        <motion.div 
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center justify-center gap-2 mb-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <span className="font-sans font-extrabold text-xl tracking-tight text-white">E</span>
          </div>
          <span className="font-sans font-bold text-2xl tracking-tight text-slate-900">
            eduvia
          </span>
          <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-orange-100 text-orange-700 border border-orange-200">
            v2.4
          </span>
        </motion.div>

        {/* Hero Copy with Slide-Up Reveal */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 12,
            delay: 0.1 
          }}
          className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-orange-600 mb-3"
        >
          Eduvia Academy
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 80,
            damping: 14,
            delay: 0.2 
          }}
          className="text-slate-600 text-lg max-w-xl mx-auto mb-12 font-sans font-light"
        >
          An integrated ecosystem linking high-fidelity student diagnostics, personalized parent commands, and real-time learning actions.
        </motion.p>

        {/* Roles Grid using Staggered Variants */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left max-w-5xl mx-auto"
        >
          {/* PARENT HUB */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5 cursor-pointer"
            onClick={() => onSelectRole('parent')}
          >
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300">
                <ShieldCheck size={24} className="group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-orange-600 mb-2">Parent Portal</h3>
              <p className="text-slate-600 text-sm font-sans mb-6">
                Oversee student mastery progress, schedule local quiz evaluations, review analytics reports, and view calendars.
              </p>
            </div>
            <button 
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/25"
            >
              <span>ENTER HUB</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </motion.div>

          {/* STUDENT SPACE */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5 cursor-pointer"
            onClick={() => onSelectRole('student')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300">
                <GraduationCap size={24} className="group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-orange-600 mb-2">Student Space</h3>
              <p className="text-slate-600 text-sm font-sans mb-6">
                Unlock active modules, complete parent-assigned assessments, solve algebra levels, and review milestones.
              </p>
            </div>
            <button 
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/25"
            >
              <span>LAUNCH DESK</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-white" />
            </button>
          </motion.div>

          {/* TEACHER HUB */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5 cursor-pointer"
            onClick={() => onSelectRole('teacher')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300">
                <Users size={24} className="group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-orange-600 mb-2">Teacher Hub</h3>
              <p className="text-slate-600 text-sm font-sans mb-6">
                Analyze class-wide performance metrics, update school agendas, release assessments, and manage classrooms.
              </p>
            </div>
            <button 
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/25"
            >
              <span>OPEN HUB</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-white" />
            </button>
          </motion.div>

          {/* ADMIN CONSOLE */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5 cursor-pointer"
            onClick={() => onSelectRole('admin')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300">
                <Sliders size={24} className="group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-orange-600 mb-2">Admin Console</h3>
              <p className="text-slate-600 text-sm font-sans mb-6">
                Upload syllabus textbooks, trigger automated RAG chunking &amp; vector indexing, and inspect system telemetry.
              </p>
            </div>
            <button 
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/25"
            >
              <span>ENTER CONSOLE</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-white" />
            </button>
          </motion.div>
        </motion.div>

        {/* Small Bottom Disclaimer with subtle drift/reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-xs text-slate-500 flex items-center justify-center gap-3 font-mono"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
            SECURE GATEWAY ENCRYPTED
          </span>
          <span>•</span>
          <span>EDU-SYSTEM V2.4</span>
        </motion.div>
      </div>
    </div>
  );
}
