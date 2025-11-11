import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllTask, assignTask } from '../api';
import axios from 'axios';

const AddTask = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    userIds: [],
    title: '',
    description: '',
    url: '',
    dueDate: ''
  });

  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(res))
      .catch(err => console.error(err));
  }, []);

  const fetchTasks = () => {
    getAllTask()
      .then(res => setTasks(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUserSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    if (selected.includes('all')) {
      const allUserIds = users.map(user => user._id);
      setFormData({ ...formData, userIds: allUserIds });
    } else {
      setFormData({ ...formData, userIds: selected });
    }
  };

  const handleCreateTask = async () => {
    const { userIds, title, dueDate } = formData;

    if (userIds.length === 0 || !title || !dueDate) {
      alert('User(s), Title, and Due Date are required');
      return;
    }

    try {
      await Promise.all(userIds.map(userId =>
        assignTask({ ...formData, userId })
      ));

      setFormData({ userIds: [], title: '', description: '', url: '', dueDate: '' });
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await axios.put(`/api/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#ffeeba', color: '#856404' };
      case 'Incomplete':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'Complete':
        return { backgroundColor: '#d4edda', color: '#155724' };
      default:
        return { backgroundColor: '#e2e3e5', color: '#383d41' };
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', padding: 20, background:'white',display:'flex',flexDirection:'column' }}>
    <div className='flex flex-row justify-between'>

      <h2 className='font-bold'>📋 Task Manager</h2>
      <button onClick={() => setShowModal(true)} style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer'
      }}>➕ Create Task</button>
    </div>

      {/* Task List */}
      <div style={{ marginTop: 20 }}>
        {tasks?.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {tasks?.map(task => {
              const statusStyle = getStatusStyles(task.status);
              return (
                <div key={task._id} style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 20,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  backgroundColor: '#fff',
                  position: 'relative'
                }}>
                  <h3>{task.title}</h3>
                  <span style={{
                    ...statusStyle,
                    padding: '5px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 'bold',
                    position: 'absolute',
                    top: 20,
                    right: 20
                  }}>{task.status}</span>

                  <p><strong>User:</strong> {task.assignedTo?.firstName} {task.assignedTo?.lastName}</p>
                  {task.description && <p><strong>Description:</strong> {task.description}</p>}
                  {task.url && (
                    <p><strong>URL:</strong> <a href={task.url} target="_blank" rel="noreferrer">{task.url}</a></p>
                  )}
                  <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>

                  <div style={{ marginTop: 10 }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      style={{ padding: 6, borderRadius: 4, width: '100%' }}
                    >
                      {['Pending', 'Incomplete', 'Complete'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button onClick={() => handleDeleteTask(task._id)} style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 20 ,
                      cursor: 'pointer',
                      width: '30%'
                    }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 8,
            width: 400
          }}>
            <h3>Create Task</h3>

            <label style={{ fontWeight: 'bold', marginTop: 10 }}>Assign To:</label>
            <select
              multiple
              name="userIds"
              value={formData.userIds}
              onChange={handleUserSelect}
              style={{ width: '100%', height: 100, marginTop: 5 }}
            >
              <option value="all">Select All</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ display: 'block', marginTop: 10, width: '100%', padding: 8 }}
            />

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ display: 'block', marginTop: 10, width: '100%', padding: 8 }}
            />

            <input
              type="text"
              name="url"
              placeholder="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              style={{ display: 'block', marginTop: 10, width: '100%', padding: 8 }}
            />

            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              style={{ display: 'block', marginTop: 10, width: '100%', padding: 8 }}
            />

            <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleCreateTask} style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: 4
              }}>Save</button>
              <button onClick={() => setShowModal(false)} style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: 4
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask;
