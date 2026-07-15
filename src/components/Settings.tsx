import React, { useState } from 'react';
import { PortalSettings } from '../types';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Trash2, 
  Check, 
  Globe, 
  Smartphone, 
  Key, 
  Lock,
  UserCheck
} from 'lucide-react';

interface SettingsProps {
  settings: PortalSettings;
  onSaveSettings: (settings: PortalSettings) => void;
}

export default function PortalSettingsComponent({ settings, onSaveSettings }: SettingsProps) {
  // Local state for the settings form
  const [fullName, setFullName] = useState(settings.fullName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  
  // Notification States
  const [emailAlerts, setEmailAlerts] = useState(settings.emailAlerts);
  const [smsNotifications, setSmsNotifications] = useState(settings.smsNotifications);
  const [weeklyReports, setWeeklyReports] = useState(settings.weeklyReports);
  
  // Account States
  const [language, setLanguage] = useState(settings.language);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(settings.twoFactorEnabled);

  // Success indicator banner state
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      fullName,
      email,
      phone,
      emailAlerts,
      smsNotifications,
      weeklyReports,
      language,
      twoFactorEnabled
    });

    setSuccess('Portal settings and notification alert rules updated successfully!');
    setTimeout(() => {
      setSuccess('');
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
          <span>Portal Configurations</span>
          <span>•</span>
          <span>Access Settings</span>
        </div>
        <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
          Portal &amp; Security Settings
        </h1>
        <p className="text-xs text-slate-500 font-sans">
          Manage your contact credentials, set weekly delivery preferences, and adjust account variables.
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex gap-3 items-center text-xs font-sans animate-bounce">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check size={16} />
          </div>
          <div>
            <span className="font-bold uppercase block text-[10px] tracking-wider text-emerald-600">Settings Saved</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Settings Layout Forms Grid (Screen 4 representation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Details & Preferences (Left Main Grid Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-sans font-bold text-slate-900 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCheck size={16} className="text-orange-500" />
              <span>Profile Settings</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                  />
                </div>

                {/* Language Preference selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                    Language Preference
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none cursor-pointer"
                  >
                    <option value="English (United States)">English (United States)</option>
                    <option value="Spanish (Latin America)">Spanish (Latin America)</option>
                    <option value="French (Europe)">French (Europe)</option>
                    <option value="Hindi (India)">Hindi (India)</option>
                  </select>
                </div>

              </div>

              {/* Save changes button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg shadow-orange-600/15 cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-sans font-bold text-slate-900 mb-5 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell size={16} className="text-orange-500" />
              <span>Notification Preferences</span>
            </h2>

            <div className="space-y-4">
              {/* Toggle 1: Email Alerts */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-sans font-bold text-xs text-slate-800 block">
                    Email Alerts
                  </span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    Receive immediate notifications upon student milestones completion or newly assigned quiz updates.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={emailAlerts}
                    onChange={() => setEmailAlerts(!emailAlerts)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                </label>
              </div>

              {/* Toggle 2: SMS Alerts */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-sans font-bold text-xs text-slate-800 block">
                    SMS Notifications
                  </span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    Send urgent calendar alarms or report cards links to your registered phone number.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={smsNotifications}
                    onChange={() => setSmsNotifications(!smsNotifications)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                </label>
              </div>

              {/* Toggle 3: Weekly Progress Report */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-sans font-bold text-xs text-slate-800 block">
                    Weekly Progress Reports
                  </span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    Compile a comprehensive Saturday performance telemetry sheet comparing child statistics.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={weeklyReports}
                    onChange={() => setWeeklyReports(!weeklyReports)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Danger Zone (Right Settings Column) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Security Credentials */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Lock size={16} className="text-orange-500" />
              <span>Security Hub</span>
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Two-Factor Authentication</span>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-sans font-semibold inline-block mt-1">
                  Currently Enabled
                </span>
              </div>

              <button 
                onClick={() => alert('Secure verification workflow initiated.')}
                className="w-full py-2.5 text-center bg-slate-50 hover:bg-slate-100 font-sans font-semibold text-xs text-slate-700 rounded-xl transition-all border border-slate-200 cursor-pointer"
              >
                Change Access Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-rose-800 mb-4 pb-2 border-b border-rose-100 flex items-center gap-1.5">
              <Trash2 size={16} className="text-rose-600" />
              <span>Danger Zone</span>
            </h3>

            <p className="text-[11px] text-rose-600 font-sans leading-relaxed mb-4">
              Deleting your parental command workspace erases all child profiles history, dispatched evaluations, and calendar databases. This action is irreversible.
            </p>

            <button 
              onClick={() => {
                if (confirm('Are you absolutely sure you want to permanently delete your Eduvia Portal account?')) {
                  alert('Delete request routed. Contact support@eduvia.org for execution.');
                }
              }}
              className="w-full py-2.5 text-center bg-rose-600 hover:bg-rose-500 font-sans font-semibold text-xs text-white rounded-xl transition-all shadow-md shadow-rose-600/15 cursor-pointer"
            >
              Delete Portal Account
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
