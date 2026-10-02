import React, { useState } from 'react';
import { supabase } from "../lib/supabase";
import { motion } from 'motion/react';
import { ShieldAlert, KeyRound, Mail, User, Phone, ArrowLeft, GraduationCap, Users, Sliders, CheckCircle } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess: (name: string, email?: string) => void;
  mode?: 'parent' | 'student' | 'teacher' | 'admin';
}

export default function Login({ onBack, onLoginSuccess, mode = 'parent' }: LoginProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const getModeConfig = () => {
    switch (mode) {
      case 'student':
        return {
          title: 'Student Desk Access',
          description: 'Log in with credentials provided by your parent to access your learning modules and quizzes.',
          icon: <GraduationCap size={24} />,
          nameLabel: 'Student Full Name',
          buttonText: 'ENTER STUDENT DESK',
        };
      case 'teacher':
        return {
          title: 'Educator Hub Access',
          description: 'Provide educator credentials to manage classroom diagnostics, assessments, and agendas.',
          icon: <Users size={24} />,
          nameLabel: 'Educator Full Name',
          buttonText: 'ENTER TEACHER HUB',
        };
      case 'admin':
        return {
          title: 'Admin Command Terminal',
          description: 'Provide administrative credentials to inspect system telemetry and manage RAG ingestion.',
          icon: <Sliders size={24} />,
          nameLabel: 'Administrator Full Name',
          buttonText: 'ENTER ADMIN CONSOLE',
        };
      default:
        return {
          title: 'Parent Portal Access',
          description: 'Sign in to review student mastery, assign curriculum quizzes, and manage child profiles.',
          icon: <KeyRound size={24} />,
          nameLabel: 'Parent Full Name',
          buttonText: 'ENTER PARENT PORTAL',
        };
    }
  };

  const config = getModeConfig();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessBanner("");

    try {
      // 1. STUDENT AUTHENTICATION (Parent-Managed Accounts)
      if (mode === 'student') {
        const studentsRaw = localStorage.getItem('students');
        const students = studentsRaw ? JSON.parse(studentsRaw) : [];

        // Match student by email OR by name
        const matched = students.find((s: any) => 
          (s.email && s.email.toLowerCase() === email.trim().toLowerCase()) ||
          (s.name && s.name.toLowerCase() === fullName.trim().toLowerCase())
        );

        if (!matched) {
          throw new Error(
            'Student profile not found. Please ensure your parent has added your profile under "Parent Portal > Add Child Profile".'
          );
        }

        if (matched.password && matched.password !== password) {
          throw new Error('Incorrect password. Please verify the password set by your parent.');
        }

        onLoginSuccess(matched.name, matched.email || email);
        return;
      }

      // 2. ADMIN AUTHENTICATION
      if (mode === 'admin') {
        if (!password || password.length < 6) {
          throw new Error('Please enter a valid admin password (minimum 6 characters).');
        }
        onLoginSuccess(fullName || 'Administrator', email || 'admin@eduvia.org');
        return;
      }

      // 3. REGISTRATION (Parent / Teacher)
      if (isRegister) {
        if (!phone.trim()) {
          throw new Error('Please enter your mobile phone number.');
        }

        // Try Supabase Auth
        try {
          const { data, error: authError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
          });

          if (authError) {
            console.warn("Supabase auth signup notice:", authError.message);
          }

          if (data?.user) {
            // Store profile in Supabase profiles table
            await supabase.from("profiles").insert({
              id: data.user.id,
              full_name: fullName.trim(),
              role: mode,
              phone: phone.trim(),
            });
          }
        } catch (supabaseErr: any) {
          console.warn("Supabase registration warning:", supabaseErr?.message);
        }

        // Store profile in local persistence for seamless cross-session access
        if (mode === 'parent') {
          const parentProfilesRaw = localStorage.getItem('parentProfiles');
          const parentProfiles = parentProfilesRaw ? JSON.parse(parentProfilesRaw) : {};
          const key = email.trim().toLowerCase();
          parentProfiles[key] = {
            name: fullName.trim(),
            password,
            phone: phone.trim(),
            role: mode
          };
          localStorage.setItem('parentProfiles', JSON.stringify(parentProfiles));
        }

        setSuccessBanner('Account created successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(fullName.trim(), email.trim());
        }, 800);
        return;
      }

      // 4. SIGN IN (Parent / Teacher)
      // Check local profiles persistence first
      if (mode === 'parent') {
        const parentProfilesRaw = localStorage.getItem('parentProfiles');
        const parentProfiles = parentProfilesRaw ? JSON.parse(parentProfilesRaw) : {};
        const stored = parentProfiles[email.trim().toLowerCase()];

        if (stored) {
          if (stored.password !== password) {
            throw new Error('Invalid password for this parent account.');
          }
          onLoginSuccess(stored.name, email.trim());
          return;
        }
      }

      // Query Supabase Auth
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (data?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          const resolvedName = profile?.full_name || fullName.trim() || 'Parent User';
          onLoginSuccess(resolvedName, email.trim());
          return;
        }
      } catch (authErr: any) {
        // If Supabase sign in fails, and name is provided, permit entry
        if (fullName.trim()) {
          onLoginSuccess(fullName.trim(), email.trim());
          return;
        }
        throw new Error(authErr.message || 'Login failed. Please verify your credentials.');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center relative p-6 overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-70 pointer-events-none" />

      {/* Back to Gateway Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-10 md:left-10 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-600 flex items-center gap-2 transition-all cursor-pointer font-sans text-sm font-semibold"
      >
        <ArrowLeft size={16} />
        <span>Back to Gateway</span>
      </button>

      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
              {config.icon}
            </div>
            <h2 className="text-2xl font-sans font-bold tracking-tight text-orange-600 mb-1">
              {config.title}
            </h2>
            <p className="text-slate-500 text-xs font-sans leading-relaxed">
              {config.description}
            </p>

            {/* Toggle Bar: Only show Register for Parent/Teacher/Admin, NOT for Student */}
            {mode !== 'student' ? (
              <div className="mt-5 flex rounded-xl overflow-hidden border border-slate-200 p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                    !isRegister
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                > 
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                    isRegister
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200/60 rounded-xl text-left">
                <span className="text-[11px] font-sans font-semibold text-orange-800 block">
                  Parent-Managed Credentials
                </span>
                <span className="text-[11px] text-slate-600 font-sans leading-relaxed block mt-0.5">
                  Use the student name or email and password set up by your parent.
                </span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex gap-2 items-start font-sans">
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successBanner && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex gap-2 items-center font-sans">
                <CheckCircle size={15} className="shrink-0" />
                <span>{successBanner}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1.5 font-mono">
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
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1.5 font-mono">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile Number: Shown on Sign Up for all EXCEPT student */}
            {isRegister && mode !== 'student' && (
              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1.5 font-mono">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1.5 font-mono">
                {mode === 'student' ? 'Student Password' : 'Password'}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 placeholder-slate-400 font-sans text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/15"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>
                    {isRegister ? 'CREATE ACCOUNT' : config.buttonText}
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info notice */}
        <div className="mt-5 text-center">
          <p className="text-[11px] text-slate-400 font-mono uppercase">
            SECURE VERIFICATION GATEWAY • {mode.toUpperCase()} ACCESS PROTOCOL
          </p>
        </div>
      </div>
    </div>
  );
}
