import React, { useEffect, useState } from "react";
import { getAllUsers, getAllTask, assignTask, updateTask, deleteTask } from "../api";
import { FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const TaskManager = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const userType = user?.userType;

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState({ my: [], others: [] });
  const [activeTab, setActiveTab] = useState("myTasks");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    userIds: [],
    title: "",
    description: "",
    url: "",
    dueDate: "",
    group: "",
  });

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error);
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    getAllTask()
      .then((res) => {
        const myTasks = res.filter((t) => t.assignedTo?._id === userId);
        const otherTasks = res.filter((t) => t.assignedTo?._id !== userId);
        setTasks({ my: myTasks, others: otherTasks });
      })
      .catch(console.error);
  };

  const handleUserSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    if (selected.includes("all")) {
      setFormData({ ...formData, userIds: users.map((u) => u._id) });
    } else {
      setFormData({ ...formData, userIds: selected });
    }
  };

  const handleCreateTask = async () => {
    let finalUserIds = formData.userIds;
    if (userType === "tutor") finalUserIds = [userId];

    if (!formData.title || !formData.dueDate || finalUserIds.length === 0) {
      alert("Title and Due Date required");
      return;
    }

    try {
      await Promise.all(
        finalUserIds.map((uid) =>
          assignTask({
            ...formData,
            userId: uid,
            assignedTo: uid,
            createdBy: userId, // ⭐ ADD CREATED BY
          })
        )
      );

      setFormData({ userIds: [], title: "", description: "", url: "", dueDate: "", group: "" });
      setShowModal(false);
      fetchTasks();
      toast.success("Task created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, status);
      fetchTasks();
      toast.success("Status updated");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      await deleteTask(taskId);
      fetchTasks();
      toast.success("Task deleted");
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Incomplete":
        return "bg-red-100 text-red-700";
      case "Complete":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ⭐ Updated TaskCard to show createdBy + createdAt
  const TaskCard = ({ task }) => (
    <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500 flex flex-col gap-2 relative">
      <div className="flex justify-between items-start text-start">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        {(userType === "admin" || userType === "teamLeader") && (
          <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDeleteTask(task._id)} />
        )}
      </div>

      {task.assignedTo && (
        <p className="text-sm text-gray-500 text-start">
          <b>Assigned To:</b> {task.assignedTo.firstName} {task.assignedTo.lastName}
        </p>
      )}

      {task.createdBy && (
        <p className="text-sm text-gray-500 text-start">
          <b>Created By:</b> {task.createdBy.firstName} {task.createdBy.lastName}
        </p>
      )}

      <p className="text-sm text-gray-400 text-start">
        <b>Created At:</b> {new Date(task.createdAt).toLocaleString()}
      </p>

      {task.description && (
        <p className="text-gray-700 text-start">
          <b>Description:</b> {task.description}
        </p>
      )}

      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline text-sm text-start"
        >
          Link
        </a>
      )}

      <p className="text-sm text-gray-500 text-start">
        <b>Due:</b> {new Date(task.dueDate).toLocaleDateString()}
      </p>

      <select
        className={`mt-2 px-2 py-1 rounded ${getStatusClasses(task.status)}`}
        value={task.status}
        onChange={(e) => handleStatusChange(task._id, e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Incomplete">Incomplete</option>
        <option value="Complete">Complete</option>
      </select>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans bg-white min-h-screen rounded-md shadow-sm">
      <header className="flex justify-between items-center mb-6 ">
        <h1 className="text-3xl font-bold">📋 Task Manager </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FaPlus /> Create Task
        </button>
      </header>

      <nav className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === "myTasks" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("myTasks")}
        >
          My Tasks
        </button>
        {userType !== "tutor" && (
          <button
            className={`px-4 py-2 rounded ${activeTab === "assignTasks" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("assignTasks")}
          >
            Assign Tasks
          </button>
        )}
      </nav>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "myTasks"
          ? tasks.my.length > 0
            ? tasks.my.map((t) => <TaskCard key={t._id} task={t} />)
            : <p className="text-gray-500">No tasks assigned to you.</p>
          : tasks.others.length > 0
          ? tasks.others.map((t) => <TaskCard key={t._id} task={t} />)
          : <p className="text-gray-500">No tasks assigned to others.</p>}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-2">Create Task</h2>

            {userType !== "tutor" && (
              <select multiple className="border rounded px-3 py-2" value={formData.userIds} onChange={handleUserSelect}>
                <option value="all">Select All</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              placeholder="Title"
              className="border rounded px-3 py-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <input
              type="text"
              placeholder="Description"
              className="border rounded px-3 py-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <input
              type="text"
              placeholder="URL"
              className="border rounded px-3 py-2"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />

            <input
              type="date"
              className="border rounded px-3 py-2"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <div className="flex justify-end gap-2 mt-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleCreateTask}>
                Save
              </button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
