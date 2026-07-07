'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { attendanceService, AttendanceRecord } from '@/services/attendance.service';
import { usersService } from '@/services/users.service';

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getEndOfWeek(date: Date) {
  const start = getStartOfWeek(date);
  return new Date(start.setDate(start.getDate() + 6));
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function AttendancePage() {
  const { user } = useAuthStore();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [targetUserId, setTargetUserId] = useState<string>('');

  const [usersList, setUsersList] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = formatDate(currentWeekStart);
      const end = formatDate(getEndOfWeek(currentWeekStart));

      const res = await attendanceService.getAttendance({
        startDate: start,
        endDate: end,
        userId: targetUserId || undefined
      });
      setRecords(res.records);

      // Check if today's record is among them (for the logged in user)
      if (!targetUserId || targetUserId === user?._id) {
        const todayStr = formatDate(new Date());
        const todayR = res.records.find((r: AttendanceRecord) => r.date === todayStr && r.userId?._id === user?._id);
        setTodayRecord(todayR || null);
      } else {
        setTodayRecord(null);
      }
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart, targetUserId, user]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    if (user?.role === 'admin') {
      usersService.getUsers(1, 100).then(res => {
        setUsersList(res.users || []);
      }).catch(console.error);
    }
  }, [user]);

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      fetchAttendance();
    } catch (error: any) {
      alert(error.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      fetchAttendance();
    } catch (error: any) {
      alert(error.message || 'Failed to check out');
    }
  };

  const previousWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Attendance
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Track your working hours and manage your timesheets.
          </p>
        </div>
      </header>

      {/* Check In / Check Out Card */}
      {(!targetUserId || targetUserId === user?._id) && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Shift</h2>
              <p className="text-slate-500 text-sm mt-1">
                {todayRecord
                  ? (todayRecord.checkOutTime ? `Completed (${todayRecord.hoursWorked.toFixed(2)} hrs)` : `In Progress (Checked in at ${formatTime(todayRecord.checkInTime)})`)
                  : 'Not checked in yet'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {!todayRecord ? (
              <button
                onClick={handleCheckIn}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Check In
              </button>
            ) : !todayRecord.checkOutTime ? (
              <button
                onClick={handleCheckOut}
                className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Check Out
              </button>
            ) : (
              <div className="w-full md:w-auto px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Shift Completed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Timesheet */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Timesheet</h2>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
              <button onClick={previousWeek} className="px-3 py-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors">←</button>
              <span className="text-sm font-medium px-2 text-slate-700 dark:text-slate-300">
                {formatDate(currentWeekStart)} to {formatDate(getEndOfWeek(currentWeekStart))}
              </span>
              <button onClick={nextWeek} className="px-3 py-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors">→</button>
            </div>
          </div>

          {user?.role === 'admin' && (
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="">My Attendance</option>
              <option value="ALL">All Users</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-500">Loading timesheet...</div>
        ) : records.length === 0 ? (
          <div className="py-12 flex justify-center text-slate-500">No attendance records found for this week.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 uppercase text-xs font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4 text-right">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {records.map(record => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {new Date(record.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {record.userId?.name || user?.name}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 text-rose-600 font-medium">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      {record.hoursWorked ? record.hoursWorked.toFixed(2) + ' hrs' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
