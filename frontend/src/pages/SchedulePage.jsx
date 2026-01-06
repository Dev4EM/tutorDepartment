import React, { useEffect, useState } from "react";

import UserDashboard from "../components/UserDashboard";
import AdminCalendarPage from "../components/AdminCalendarPage"; 
import CalendarView from "../components/CalendarView";
import AccountSelectionPage from "./AccountSelectionPage";
import AdminDashboard from "../components/AdminDashboard";


export default function SchedulePage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [currentUser, setCurrentUser] = useState(user);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    // const user = JSON.parse(localStorage.getItem("user"));
  // USERS (only one user right now)
  const [users, setUsers] = useState([
    {
      _id: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      userType: user?.userType,
    },
  ]);

  // TASKS
  const [tasks, setTasks] = useState([
    {
      _id: "t1",
      title: "Check Emails",
      type: "daily",
      assignedTo: user?.id,
      assignedBy: "admin",
      status: {
        "2025-11-23": "completed",
        "2025-11-21": "pending",
      },
    },
    {
      _id: "t2",
      title: "Finish Module A",
      type: "one-time",
      date: "2025-11-23",
      assignedTo: user?.id,
      assignedBy: "admin",
      status: {
        "2025-11-23": "completed",
      },
    },
    {
      _id: "t3",
      title: "Finish Module A",
      type: "one-time",
      date: "2025-11-25",
      assignedTo: user?.id,
      assignedBy: "admin",
      status: {
        "2025-11-25": "completed",
      },
    },
  ]);

  useEffect(() => {
    setCurrentUser(user);
  }, []);

  // ADMIN MODE → SHOW FULL CALENDAR
  if (currentUser?.userType === "admin") {
    return (
      <AdminDashboard  />
    );
  }

  // NORMAL USER MODE → OLD LAYOUT
  return (
    <div className="p-6 min-h-screen bg-white rounded-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Daily Task Scheduler
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">

        {/* LEFT - Calendar */}
        <div className="md:col-span-2 w-full">
          <CalendarView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            tasks={tasks}
            user={currentUser}
          />
        </div>

        {/* RIGHT - User Dashboard */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg border">
          <UserDashboard
            user={currentUser}
            tasks={tasks}
            date={selectedDate}
            setTasks={setTasks}
          />
        </div>
      </div>
    </div>
  );
}
