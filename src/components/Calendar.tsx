import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarEvent } from '../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Info, 
  Check,
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  selectedStudentId: string;
  studentName: string;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function AcademicCalendar({
  events,
  selectedStudentId,
  studentName,
  onAddEvent
}: CalendarProps) {
  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(isoToday);
  const [newEventType, setNewEventType] = useState<'exam' | 'assessment' | 'activity'>('assessment');

  useEffect(() => {
    if (selectedStudentId) {
      const now = new Date();
      setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
      setSelectedDay(now.getDate());
      setNewEventDate(now.toISOString().slice(0, 10));
    }
  }, [selectedStudentId]);

  // Month configurations
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    onAddEvent({
      title: newEventTitle,
      date: newEventDate,
      type: newEventType,
      studentId: selectedStudentId,
      studentName: studentName
    });

    setNewEventTitle('');
    setShowAddModal(false);
  };

  // Format single date to YYYY-MM-DD
  const formatDateString = (dayNum: number) => {
    const dStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    return `${year}-${mStr}-${dStr}`;
  };

  // Filter events for selected day
  const getEventsForDay = (dayNum: number) => {
    const formatted = formatDateString(dayNum);
    return events.filter(e => e.date === formatted);
  };

  // Filter events specifically for the active student on selected day
  const activeStudentDayEvents = selectedDay 
    ? getEventsForDay(selectedDay).filter(e => !e.studentId || e.studentId === selectedStudentId)
    : [];

  // Generate calendar cells (blanks then days)
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
            <span>Scheduling Tracker</span>
            <span>•</span>
            <span>Academic Milestones</span>
          </div>
          <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
            Academic Calendar &amp; Deadlines
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Verify upcoming classroom quizzes, state exams, and custom portal tasks scheduled for {studentName}.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
        >
          <Plus size={15} />
          <span>New Event</span>
        </button>
      </div>

      {/* CALENDAR MAIN LAYOUT (Screen 10 representation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* October 2024 monthly grid calendar */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          {/* Calendar Header switcher */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-sans font-bold text-base text-slate-800">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-400 uppercase font-semibold mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* October Monthly Grid cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/50 rounded-lg border border-transparent" />;
              }

              const isSelected = selectedDay === day;
              const dayEvents = getEventsForDay(day);
              const studentSpecificEvents = dayEvents.filter(e => !e.studentId || e.studentId === selectedStudentId);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-1.5 border rounded-lg cursor-pointer flex flex-col justify-between transition-all select-none ${
                    isSelected 
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/15' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800'
                  }`}
                >
                  <span className="font-mono text-xs font-bold">{day}</span>

                  {/* Dot markers for daily activities */}
                  <div className="flex justify-center gap-1 mt-auto">
                    {studentSpecificEvents.slice(0, 3).map((ev) => {
                      let color = 'bg-orange-500';
                      if (ev.type === 'exam') color = 'bg-rose-500';
                      if (ev.type === 'assessment') color = 'bg-purple-500';
                      if (ev.type === 'holiday') color = 'bg-amber-500';
                      return (
                        <div 
                          key={ev.id} 
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : color}`} 
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend indicator */}
          <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Quarterly / Term Exams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-purple-500" />
              <span>Assigned Homework Evaluations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-orange-500" />
              <span>General Activities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>School-wide Holidays</span>
            </div>
          </div>
        </div>

        {/* Sidebar Schedule (Screen 10 right panel representation) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Day Focus Schedule</span>
              {selectedDay && (
                <span className="text-[10px] font-mono text-orange-600 font-semibold uppercase">
                  {monthNames[month]} {selectedDay}
                </span>
              )}
            </h3>

            {/* List of active student day events */}
            <div className="space-y-3.5">
              {selectedDay ? (
                activeStudentDayEvents.length > 0 ? (
                  activeStudentDayEvents.map((ev) => (
                    <div key={ev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-sans font-semibold text-xs shrink-0 ${
                        ev.type === 'exam' 
                          ? 'bg-rose-50 text-rose-600' 
                          : 'bg-orange-50 text-orange-600'
                      }`}>
                        {ev.type === 'exam' ? 'EX' : 'AS'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-sans font-bold text-xs text-slate-800 block leading-tight">
                          {ev.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">
                          Type: {ev.type.toUpperCase()} • For {ev.studentName || 'School-wide'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-xs font-sans">
                      No active assessments or exams on this date.
                    </p>
                    <span className="text-[10px] text-orange-600 hover:underline cursor-pointer block mt-1" onClick={() => setShowAddModal(true)}>
                      + Schedule an assessment now
                    </span>
                  </div>
                )
              ) : (
                <p className="text-slate-400 text-xs font-sans text-center py-6">
                  Select any date on the calendar grid to view detailed schedule items.
                </p>
              )}
            </div>
          </div>

          {/* School Term Dates list block */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
              School-wide Academic Dates
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-start text-xs font-sans">
                <div>
                  <span className="font-bold text-slate-800 block">Quarterly Exams Block</span>
                  <span className="text-slate-400 font-mono text-[10px]">October 15 - October 20</span>
                </div>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">Active</span>
              </div>

              <div className="flex justify-between items-start text-xs font-sans">
                <div>
                  <span className="font-bold text-slate-800 block">Half-Yearly Exams Block</span>
                  <span className="text-slate-400 font-mono text-[10px]">December 10 - December 22</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded uppercase">Upcoming</span>
              </div>

              <div className="flex justify-between items-start text-xs font-sans">
                <div>
                  <span className="font-bold text-slate-800 block">Final Term Evaluation</span>
                  <span className="text-slate-400 font-mono text-[10px]">Coming Soon</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">Pending</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ADD EVENT MODAL (Screen 10 form popup) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.93, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 5 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <h3 className="font-sans font-bold text-base text-slate-900 flex items-center gap-2">
                  <Calendar size={18} className="text-orange-500" />
                  <span>Add Academic Calendar Event</span>
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-sans font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleAddEventSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                    Event Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Assessment Prep"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                      Event Type
                    </label>
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="assessment">Assessment</option>
                      <option value="exam">Exam</option>
                      <option value="activity">Activity</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                      Date Selector
                    </label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full p-2 px-2.5 border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-2 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 font-sans font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white font-sans font-semibold text-xs rounded-xl shadow-lg shadow-orange-600/15 transition-all cursor-pointer"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
