import React, { useState, useMemo } from "react";
import dayjs from "dayjs";

export default function AdminCalendarPage() {
      const user = JSON.parse(localStorage.getItem("user"));
  const  tasks = [
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
]

const users = [
  { _id: "u1", firstName: "John", lastName: "Doe",userType:'admin' }
]

  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  const firstDay = startOfMonth.startOf("week");
  const lastDay = endOfMonth.endOf("week");

  const totalDays = lastDay.diff(firstDay, "day") + 1;

  const monthDays = Array.from({ length: totalDays }, (_, i) =>
    firstDay.add(i, "day")
  );

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = {};

    tasks.forEach((task) => {
      if (task.type === "daily") {
        // daily → assign for every day in current view
        monthDays.forEach((d) => {
          const date = d.format("YYYY-MM-DD");
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(task);
        });
      } else if (task.type === "range") {
        const from = dayjs(task.range.from);
        const to = dayjs(task.range.to);

        monthDays.forEach((d) => {
          if (d.isAfter(from.subtract(1, "day")) && d.isBefore(to.add(1, "day"))) {
            const date = d.format("YYYY-MM-DD");
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(task);
          }
        });
      } else {
        // one-time tasks
        const date = task.date;
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
      }
    });

    return grouped;
  }, [tasks, monthDays]);

  // Month Navigation
  const nextMonth = () => setCurrentMonth((prev) => prev.add(1, "month"));
  const prevMonth = () => setCurrentMonth((prev) => prev.subtract(1, "month"));
  const goToday = () => setCurrentMonth(dayjs());

  // User Colors
  const colors = [
    "bg-red-300",
    "bg-blue-300",
    "bg-green-300",
    "bg-yellow-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-indigo-300",
  ];
  const getColor = (id) => colors[id?.length % colors.length];

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">

      {/* Users Sidebar */}
      <div className="w-60 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Users</h2>

        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center space-x-2 p-2 border rounded"
            >
              <span className={`w-3 h-3 rounded-full ${getColor(u._id)}`}></span>
              <span>
                {u.firstName} {u.lastName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{currentMonth.format("MMMM YYYY")}</h1>

          <div className="space-x-2">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={prevMonth}>
              ← Prev
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={goToday}>
              Today
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={nextMonth}>
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 auto-rows-[150px]">
          {monthDays.map((day, i) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayTasks = tasksByDate[dateStr] || [];

            const isCurrentMonth = day.month() === currentMonth.month();

            return (
              <div
                key={i}
                className={`p-2 border rounded-lg shadow overflow-y-auto ${
                  isCurrentMonth ? "bg-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                <div className="font-semibold">{day.format("D")}</div>

                <div className="mt-2 space-y-1">
                  {dayTasks.map((t) => {
                    const user = users.find((u) => u._id === t.assignedTo);
                    return (
                      <div
                        key={t._id}
                        className={`p-1 rounded text-xs shadow ${getColor(t.assignedTo)}`}
                      >
                        <div className="font-semibold truncate">{t.title}</div>
                        <div className="text-[10px] truncate">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-[10px]">
                          Status:{" "}
                          {t.status?.[dateStr] || "pending"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
