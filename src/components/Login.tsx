import React, { useState } from 'react';
import { supabase } from "../lib/supabase";
import { motion } from 'motion/react';
import { ShieldAlert, KeyRound, Mail, Sparkles, User, ArrowLeft, GraduationCap, Users, Sliders } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  // Pass back name and email so the app can sync profile display values
  onLoginSuccess: (name: string, email?: string) => void;
  mode?: 'parent' | 'student' | 'teacher' | 'admin';
}

export default function Login({ onBack, onLoginSuccess, mode = 'parent' }: LoginProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const getModeConfig = () => {
    switch (mode) {
      case 'student':
        return {
          title: 'Student Desk Access',
          description: 'Log in with your student account to launch active learning modules and assessments.',
          icon: <GraduationCap size={24} />,
          nameLabel: 'Student Name',
          autofillName: 'Julian Stark',
          autofillEmail: 'julian.stark@student.eduvia.org',
          autofillPass: 'studentpass123',
          buttonText: 'LAUNCH STUDENT DESK',
          autofillBtnText: 'AUTOFILL STUDENT DEMO'
        };
      case 'teacher':
        return {
          title: 'Educator Terminal Access',
          description: 'Provide faculty credentials to manage classroom diagnostics and agendas.',
          icon: <Users size={24} />,
          nameLabel: 'Educator Name',
          autofillName: 'Prof. Arthur Pendelton',
          autofillEmail: 'a.pendelton@eduvia.org',
          autofillPass: 'facultypass123',
          buttonText: 'ENTER TEACHER HUB',
          autofillBtnText: 'AUTOFILL TEACHER DEMO'
        };
      case 'admin':
        return {
          title: 'Admin Command Terminal',
          description: 'Provide administrator credentials to manage curriculum ingestion and platform systems.',
          icon: <Sliders size={24} />,
          nameLabel: 'Admin Name',
          autofillName: 'System Administrator',
          autofillEmail: 'admin@eduvia.org',
          autofillPass: 'adminpass123',
          buttonText: 'ENTER ADMIN CONSOLE',
          autofillBtnText: 'AUTOFILL ADMIN DEMO'
        };
      default:
        return {
          title: 'Parent Command Access',
          description: 'Provide credentials to unlock student dashboard telemetry.',
          icon: <KeyRound size={24} />,
          nameLabel: 'Full Name',
          autofillName: 'Dr. Eleanor Thorne',
          autofillEmail: 'e.thorne@edu-academy.com',
          autofillPass: 'demopassword123',
          buttonText: 'UNLOCK WORKSPACE',
          autofillBtnText: 'AUTOFILL PARENT DEMO'
        };
    }
  };

  const config = getModeConfig();

  const handleAutofill = () => {
    setFullName(config.autofillName);
    setEmail(config.autofillEmail);
    setPassword(config.autofillPass);
    setError('');
  };

  const handleUnlock = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {

    // For parent mode, check localStorage first for demo persistence
    const parentProfilesRaw = localStorage.getItem('parentProfiles');
    const parentProfiles = parentProfilesRaw ? JSON.parse(parentProfilesRaw) : {};

    if (!isRegister && mode === 'parent') {
      const stored = parentProfiles[email?.toLowerCase()];
      if (stored) {
        // validate password first
        if (stored.password !== password) {
          throw new Error('Invalid password for this email');
        }
        // validate provided name matches stored name
        if (fullName.trim() !== stored.name) {
          throw new Error('Invalid username for this email');
        }
        // successful local login
        onLoginSuccess(stored.name, email);
        setLoading(false);
        return;
      }
    }

    // Local admin auth: allow seamless access for demo
    if (!isRegister && mode === 'admin') {
      onLoginSuccess(fullName || 'System Administrator', email || 'admin@eduvia.org');
      setLoading(false);
      return;
    }

    // Local student auth: if a student exists in localStorage, validate against it
    if (!isRegister && mode === 'student') {
      try {
        const studentsRaw = localStorage.getItem('students');
        const students = studentsRaw ? JSON.parse(studentsRaw) : [];
        const matched = students.find((s: any) => s.email && s.email.toLowerCase() === email?.toLowerCase());
        if (matched) {
          if (matched.password !== password) {
            throw new Error('Invalid password for this student');
          }
          if (fullName.trim() !== matched.name) {
            throw new Error('Invalid username for this email');
          }
          onLoginSuccess(matched.name, email);
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore JSON errors and fall back to server login
      }
    }

    if (isRegister) {
        console.log("REGISTER BLOCK");

      // CREATE ACCOUNT
      console.log("Email:", email);
      console.log("Password:", password);
      console.log(JSON.stringify(email));

      const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
      });

      console.log("Signup data:", data);
      console.log("Signup error:", error);

      if (error) throw error;

      if (!data.user) {
        throw new Error("User was not created.");
      }

      // Save profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: mode,
          phone: "",
        });

      if (profileError) throw profileError;

      alert("Registration Successful!");
      // persist parent profile locally for demo-mode logins
      if (mode === 'parent') {
        const key = email.trim().toLowerCase();
        parentProfiles[key] = { name: fullName, password, phone: '' };
        localStorage.setItem('parentProfiles', JSON.stringify(parentProfiles));
      }

      onLoginSuccess(fullName, email);

    } else {
      console.log("LOGIN BLOCK");

      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Login data:", data);
      console.log("Login error:", error);

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== mode) {
        throw new Error(
          `This account is registered as ${profile.role}`
        );
      }

      // Ensure the provided name matches stored profile name
      if (fullName.trim() !== profile.full_name) {
        throw new Error('Invalid username for this email');
      }

      onLoginSuccess(profile.full_name, email);

    }

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center relative p-6 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-70 pointer-events-none" />

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-10 md:left-10 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-600 flex items-center gap-2 transition-all cursor-pointer font-sans text-sm font-semibold"
      >
        <ArrowLeft size={16} />
        <span>Back to Gateway</span>
      </button>

      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
              {config.icon}
            </div>
            <h2 className="text-2xl font-sans font-bold tracking-tight text-orange-600 mb-1">
              {config.title}
            </h2>
            <p className="text-slate-500 text-sm font-sans">
              {config.description}
            </p>
            <div className="mt-6 flex rounded-xl overflow-hidden border border-slate-200">

              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-3 font-semibold ${
                  !isRegister
                    ? "bg-orange-600 text-white"
                    : "bg-white text-slate-700"
                }`}
              > 
              Login
            </button>

            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-3 font-semibold ${
                isRegister
                  ? "bg-orange-600 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              Register
            </button>

          </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex gap-2 items-center font-sans">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2 font-mono">
                {config.nameLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-950 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2 font-mono">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-950 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2 font-mono">
                Secret Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-950 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleAutofill}
                className="py-3 px-4 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-600 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-orange-600 animate-pulse" />
                <span>{config.autofillBtnText}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-orange-600/15"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{config.buttonText}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info notice */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500 font-mono uppercase">
            SECURE VERIFICATION GATEWAY • {mode.toUpperCase()} ACCESS PROTOCOL ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
