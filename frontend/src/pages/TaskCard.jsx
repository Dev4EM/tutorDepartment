import React from 'react';
import toast from 'react-toastify';

const TaskCard = ({ task, userType, token, onTaskUpdated, onTaskDeleted }) => {
  const dueDate = new Date(task.dueDate).toLocaleDateString();

  const handleStatusChange = async (e) => {
    try {
      const newStatus = e.target.value;
      const res = await fetch(`/api/tasks/${task._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success('Task status updated');
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete task');

      toast.success('Task deleted');
      onTaskDeleted();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
        <p className="text-sm text-gray-700 mb-1">{task.description}</p>
        <p className="text-sm text-gray-600">Due: {dueDate}</p>
        <p className="text-sm text-gray-600">
          Assigned By: {task.assignedByName || 'Unknown'}
        </p>
        <p className="text-sm text-gray-600">
          Assigned To: {task.assignedToName || 'Unknown'}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="Pending">Pending</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Complete">Complete</option>
        </select>

        {(userType === 'admin' || userType === 'teamLeader') && (
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
