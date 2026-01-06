import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchSchedulesByUser, updateTaskStatus, createSchedules, deleteSchedules } from "../api"; 
import { IoIosCreate } from "react-icons/io";
export default function UserDashboard({ user, date }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState(date);
  const [newEndDate, setNewEndDate] = useState(date);

  // Fetch tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchSchedulesByUser(user.id, date, date);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [user.id, date]);

  // Toggle task status
  const toggleStatus = async (task) => {
    const currentStatus = task.statusByDate?.[date] || "pending";
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await updateTaskStatus(task._id, date, newStatus);
      setTasks(prev =>
        prev.map(t => t._id === task._id
          ? { ...t, statusByDate: { ...t.statusByDate, [date]: newStatus } }
          : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Create new task from modal
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const taskData = {
      title: newTitle,
      description: newDescription,
      assignedTo: user.id,
      createdBy: user.id,
      startDate: newStartDate,
      endDate: newEndDate,
      taskType: "daily",
    };

    try {
      const newTask = await createSchedules(taskData);
      setTasks(prev => [...prev, newTask]);
      setShowModal(false); // Close modal
      setNewTitle("");
      setNewDescription("");
      setNewStartDate(date);
      setNewEndDate(date);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete task
  const handleDeleteTask = async (task) => {
    try {
      await deleteSchedules(task._id, date);
      setTasks(prev => prev.filter(t => t._id !== task._id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter today's tasks
  const todayTasks = tasks.filter(task => {
    if (task.assignedTo._id !== user.id) return false;
    if (task.taskType === "daily") return true;
    if (task.taskType === "daily" && task.statusByDate?.[date]) return true;
    return false;
  });

  return (
    <div className="text-black rounded-2xl p-6 shadow-xl h-full overflow-y-auto relative">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-2xl font-semibold">{user.firstName}'s Tasks</h2>
        <span className="text-gray-400">{dayjs(date).format("DD/MM/YYYY")}</span>
      </div>

      {/* Create Task Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-4 py-2 text-2xl transition absolute top-0 right-0"
      >
        <IoIosCreate/>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative">
            <h3 className="text-lg font-semibold mb-4">Create Task</h3>
            <form className="space-y-3" onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                className="w-full border px-3 py-2 rounded"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description (optional)"
                className="w-full border px-3 py-2 rounded"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <div className="flex flex-col w-1/2">
                  <label className="text-sm text-gray-500">Start Date</label>
                  <input
                    type="date"
                    className="border px-2 py-1 rounded"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col w-1/2">
                  <label className="text-sm text-gray-500">End Date</label>
                  <input
                    type="date"
                    className="border px-2 py-1 rounded"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <p className="text-gray-400 italic mb-4">Loading tasks...</p>}

      {/* No tasks */}
      {!loading && todayTasks.length === 0 && (
        <p className="text-gray-400 italic">No tasks for today.</p>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {todayTasks.map(task => {
          const status = task.statusByDate?.[date] || "pending";
          const isCreator = task.createdBy._id === user.id;

          return (
            <div key={task._id} className="bg-white p-4 rounded-xl shadow border border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    {task.taskType === "daily"}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                    ${status === "completed"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    }`}
                >
                  {status}
                </span>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleStatus(task)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold
                    ${status === "completed"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                    } transition`}
                >
                  Mark {status === "completed" ? "Pending" : "Completed"}
                </button>

                {isCreator && (
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-300 hover:bg-gray-400 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
