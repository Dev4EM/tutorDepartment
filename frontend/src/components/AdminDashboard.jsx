import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  getTutors, 
  getSchedules as getTasks, 
  createSchedules as createTask, 
  deleteSchedules as deleteTask,
  updateSchedulesStatus as updateTaskStatusByDate
} from "../api";

dayjs.extend(isBetween);

const statusColors = {
  pending: "bg-yellow-300",
  completed: "bg-green-300",
  missed: "bg-red-300"
};

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("week"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [description, setDescription] = useState("");

  // ===================== FETCH USERS =====================
  const fetchTutors = async () => {
    try {
      const data = await getTutors();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching tutors");
      setUsers([]);
    }
  };

  useEffect(() => { fetchTutors(); }, []);

  // ===================== WEEK DAYS =====================
  const weekDays = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, "day")), 
    [currentWeekStart]
  );

  // ===================== FETCH SCHEDULES =====================
  const fetchSchedules = async () => {
    if (!users.length) return;
    setLoading(true);
    try {
      const start = weekDays[0].format("YYYY-MM-DD");
      const end = weekDays[6].format("YYYY-MM-DD");
      const allSchedules = await getTasks(start, end);
      setSchedules(allSchedules);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching schedules");
      setSchedules([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSchedules(); }, [users, currentWeekStart]);

  // ===================== MAP SCHEDULES =====================
// Inside AdminDashboard component

// ===================== MAP SCHEDULES =====================
const schedulesByUserAndDate = useMemo(() => {
  if (!users.length) return {};
  const map = {};

  users.forEach(user => {
    map[user.id] = {}; // map of date -> array of schedules
  });

  schedules.forEach(s => {
    if (s.createdBy?._id !== userId) return;
    const assignedUserId = s.assignedTo?._id;
    if (!assignedUserId || !map[assignedUserId]) return;

    // Loop only over statusByDate keys
    if (s.statusByDate) {
      for (const [dateStr, status] of Object.entries(s.statusByDate)) {
        if (!map[assignedUserId][dateStr]) map[assignedUserId][dateStr] = [];
        map[assignedUserId][dateStr].push(s);
      }
    }
  });

  return map;
}, [users, schedules]);


  // ===================== NAVIGATION =====================
  const prevWeek = () => setCurrentWeekStart(prev => prev.subtract(1, "week"));
  const nextWeek = () => setCurrentWeekStart(prev => prev.add(1, "week"));
  const goToday = () => setCurrentWeekStart(dayjs().startOf("week"));

  // ===================== CREATE SCHEDULE =====================
  useEffect(() => { 
    if (users.length && !assignedUser) setAssignedUser(users[0].id); 
  }, [users]);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    const scheduleData = { 
      title: newTitle, 
      description, 
      assignedTo: assignedUser, 
      createdBy: userId, 
      startDate, 
      endDate, 
      taskType: "daily" 
    };
    try {
      const newSchedule = await createTask(scheduleData);
      setSchedules(prev => [...prev, newSchedule]);
      toast.success("Schedule created!");
      setNewTitle(""); 
      setStartDate(dayjs().format("YYYY-MM-DD")); 
      setEndDate(dayjs().format("YYYY-MM-DD")); 
      setDescription(""); 
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Error creating schedule");
    }
    setLoading(false);
  };

  // ===================== DELETE SCHEDULE (single date) =====================
  const handleDeleteSchedule = async (schedule, date) => {
    setLoading(true);
    try {
      await deleteTask(schedule._id, date); // Pass the date to backend

      setSchedules(prev => prev.map(s => {
        if (s._id === schedule._id) {
          const newStatusByDate = {...s.statusByDate};
          delete newStatusByDate[date];

          if (Object.keys(newStatusByDate).length === 0) return null;
          return {...s, statusByDate: newStatusByDate};
        }
        return s;
      }).filter(Boolean));

      toast.success(`Task deleted for ${date}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting task for this date");
    }
    setLoading(false);
  };

  // ===================== UPDATE STATUS =====================
  const handleUpdateStatus = async (schedule, date, status) => {
    setLoading(true);
    try {
      await updateTaskStatusByDate(schedule._id, date, status);

      setSchedules(prev => prev.map(s => {
        if (s._id === schedule._id) {
          return {
            ...s,
            statusByDate: {...s.statusByDate, [date]: status}
          };
        }
        return s;
      }));

      toast.success("Status updated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating status");
    }
    setLoading(false);
  };

  // ===================== LOADING =====================
  if (!users.length) return <div className="p-6 text-center text-gray-500">Loading tutors...</div>;

  // ===================== RENDER =====================
  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Daily Task Scheduler
      </h1>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Tabs */}
      <div className="flex mb-4 space-x-4">
        <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 rounded ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Dashboard</button>
        <button onClick={() => setActiveTab("create")} className={`px-4 py-2 rounded ${activeTab === "create" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Create Schedule</button>
      </div>

      {/* CREATE SCHEDULE FORM */}
      {activeTab === "create" ? (
        <div className="bg-white p-6 rounded shadow-md max-w-md">
          <h2 className="text-xl font-semibold mb-4">Create New Schedule</h2>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <input 
              className="w-full border px-3 py-2 rounded" 
              placeholder="Schedule title" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              required 
            />
            <select 
              value={assignedUser} 
              onChange={(e) => setAssignedUser(e.target.value)} 
              className="w-full border px-3 py-2 rounded"
            >
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="date" className="w-full border px-3 py-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" className="w-full border px-3 py-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <textarea className="w-full border px-3 py-2 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Create Schedule</button>
          </form>
        </div>
      ) : (
        // DASHBOARD
        <div className="overflow-x-auto">
          <div className="flex mb-4 space-x-4">
            <button onClick={prevWeek} className="px-3 py-1 bg-gray-300 rounded">Prev Week</button>
            <button onClick={goToday} className="px-3 py-1 bg-gray-300 rounded">Today</button>
            <button onClick={nextWeek} className="px-3 py-1 bg-gray-300 rounded">Next Week</button>
          </div>

          {loading && <div className="text-center text-gray-500 mb-2">Updating...</div>}

          {/* WEEKLY GRID */}
         {/* WEEKLY GRID */}
<div className="grid" style={{ gridTemplateColumns: `150px repeat(7, 1fr)` }}>
  {/* Header */}
  <div className="border p-2 bg-gray-100 font-bold">Tutors</div>
  {weekDays.map(day => (
    <div key={day.format("YYYY-MM-DD")} className="border p-2 bg-gray-100 text-center font-bold">
      {day.format("DD/MM")}
    </div>
  ))}

  {/* Users rows */}
  {users.map(user => (
    <React.Fragment key={user.id}>
      {/* User name column */}
      <div className="border p-2 font-semibold bg-gray-50">{user.name}</div>

      {/* Tasks for each date */}
      {weekDays.map(day => {
        const dateStr = day.format("YYYY-MM-DD");
        const daySchedules = schedulesByUserAndDate[user.id]?.[dateStr] || [];
        return (
          <div key={dateStr} className="border p-1 min-h-[60px] flex flex-col">
            
            {daySchedules.map(s => {
              const status = s.statusByDate?.[dateStr] || "pending";
              return (
                <div key={s._id} className={`${statusColors[status]} text-sm rounded-full p-2 mt-1 flex justify-between items-center`}>
                  <span>{s.title}</span>

                  {/* Status Dropdown */}
                 

                  {/* Delete Button */}
                  <button 
                    className="ml-2 text-red-600 font-bold"
                    onClick={() => handleDeleteSchedule(s, dateStr)}
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </React.Fragment>
  ))}
</div>

        </div>
      )}
    </div>
  );
}
