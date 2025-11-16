import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskCard = ({ task, userType, token, onTaskUpdated, onTaskDeleted }) => {
  const dueDate = new Date(task.dueDate).toLocaleDateString();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-400';
      case 'Incomplete':
        return 'bg-red-500';
      case 'Complete':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleStatusChange = async (e) => {
    try {
      const newStatus = e.target.value;
      const res = await updateTask(task._id, { status: newStatus });

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
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
          <span className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        {task.description && (
          <p className="text-gray-600 mt-2">{task.description}</p>
        )}
      </div>

      {/* Details */}
      <div className="text-gray-600 text-sm space-y-1 mb-4">
        <p><strong>Due:</strong> {dueDate}</p>
        <p><strong>Assigned By:</strong> {task.assignedByName || 'Unknown'}</p>
        <p><strong>Assigned To:</strong> {task.assignedToName || 'Unknown'}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Pending">Pending</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Complete">Complete</option>
        </select>

        {(userType === 'admin' || userType === 'teamLeader') && (
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            Delete Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
