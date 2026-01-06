import React, { useEffect, useState } from "react";
import { FaCircleChevronLeft as ChevronLeft, FaCircleChevronRight as ChevronRight } from "react-icons/fa6";
import { fetchSchedulesByUser, updateTaskStatus } from "../api";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView({ selectedDate, setSelectedDate, user }) {
  const [tasks, setTasks] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } 
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } 
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const formatDateString = (y, m, d) => {
    const monthStr = (m + 1).toString().padStart(2, "0");
    const dayStr = d.toString().padStart(2, "0");
    return `${y}-${monthStr}-${dayStr}`;
  };

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  // Fetch tasks for the month
  useEffect(() => {
    const startDate = formatDateString(year, month, 1);
    const endDate = formatDateString(year, month, daysInMonth);

    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await fetchSchedulesByUser(user.id, startDate, endDate);
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    loadTasks();
  }, [user.id, year, month, daysInMonth]);

  // Get tasks for a specific date
  const getTasksForDate = (date) =>
    tasks.filter(t => {
      if (t.assignedTo._id !== user.id) return false;
      return t.statusByDate?.[date]; // only if task has this date
    });

  const getDots = (dayTasks) => {
    const taskCount = dayTasks.length;
    if (taskCount <= 4) return dayTasks;
    return dayTasks.slice(0, 4).concat([{ title: `+${taskCount - 4}` }]);
  };

  const handleToggleStatus = async (task, date) => {
    const currentStatus = task.statusByDate[date];
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await updateTaskStatus(task._id, date, newStatus);
      setTasks(prev => prev.map(t => t._id === task._id ? {
        ...t,
        statusByDate: { ...t.statusByDate, [date]: newStatus }
      } : t));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 select-none">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={22} /></button>
        <h2 className="text-xl font-semibold text-gray-800">{monthName} {year}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={22} /></button>
      </div>

      {loading && <p className="text-gray-400 italic mb-2">Loading tasks...</p>}

      {/* Week Days */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
        {weekDays.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="p-2 h-20"></div>;

          const dateStr = formatDateString(year, month, day);
          const dayTasks = getTasksForDate(dateStr);
          const dots = getDots(dayTasks);
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`cursor-pointer flex flex-col items-center p-2 rounded-xl transition-all h-20
                ${isSelected ? "bg-purple-500 text-white shadow-lg scale-105" : "bg-white hover:bg-gray-100 text-gray-700"}
                border border-gray-200`}
            >
              <div className="text-lg font-semibold">{day}</div>
              <div className="flex gap-1 mt-1 flex-wrap justify-center">
                {dots.map((task, i) => {
                  const status = task.statusByDate?.[dateStr] || "pending";
                  const isPlus = task.title?.startsWith("+");
                  return (
                    <span
                      key={i}
                      className={`${isPlus ? "text-xs font-bold text-purple-600" : "w-2 h-2 rounded-full block"} 
                        ${status === "completed" ? "bg-green-500" : status === "pending" ? "bg-yellow-400" : "bg-red-500"}`}
                      title={isPlus ? task.title : task.title}
                      onClick={() => !isPlus && handleToggleStatus(task, dateStr)}
                    >
                      {isPlus ? task.title : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
