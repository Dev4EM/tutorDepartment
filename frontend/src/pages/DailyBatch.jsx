import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import { getProgram, createProgram, updateProgram, deleteProgram } from '../api';

const DailyBatch = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getProgram();
      setPrograms(data || []);
    } catch {
      toast.error('❌ Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    if (diff < 0) return 'Invalid dates';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const handleSubmit = async () => {
    const { name, description, startDate, endDate } = formData;
    if (!name || !startDate || !endDate)
      return toast.error('Please fill in all required fields');

    const payload = {
      name,
      description: description || 'No description',
      startDate,
      endDate,
      duration: calculateDuration(startDate, endDate),
    };

    try {
      if (editMode && selectedId) {
        await updateProgram(selectedId, payload);
        toast.success('✏️ Program updated successfully');
      } else {
        await createProgram(payload);
        toast.success('✅ Program added successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
      setEditMode(false);
      setSelectedId(null);
      fetchPrograms();
    } catch {
      toast.error('❌ Failed to save program');
    }
  };

  const handleEdit = (program) => {
    setFormData({
      name: program.name,
      description: program.description,
      startDate: program.startDate.split('T')[0],
      endDate: program.endDate.split('T')[0],
    });
    setSelectedId(program._id || program.id);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await deleteProgram(id);
        toast.info('🗑️ Program deleted');
        fetchPrograms();
      } catch {
        toast.error('❌ Failed to delete program');
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/batch/${id}`); // 🧭 navigate to details page
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-xl shadow-sm">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
        📅 Programs / Workshops
      </h2>

      {/* Add Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditMode(false);
            setFormData({ name: '', description: '', startDate: '', endDate: '' });
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-all"
        >
          <FaPlus /> Add Program
        </button>
      </div>

      {/* Loading / Empty / List */}
      {loading ? (
        <p className="text-center text-gray-600 italic">⏳ Loading programs...</p>
      ) : programs.length === 0 ? (
        <p className="text-center text-gray-500">No programs available. Add one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program._id || program.id}
              onClick={() => handleViewDetails(program._id || program.id)}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{program.name}</h3>
                <div
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()} // prevent navigating when clicking icons
                >
                  <FaEdit
                    onClick={() => handleEdit(program)}
                    className="text-green-500 cursor-pointer hover:text-green-600"
                  />
                  <FaTrash
                    onClick={() => handleDelete(program._id || program.id)}
                    className="text-red-500 cursor-pointer hover:text-red-600"
                  />
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3">{program.description}</p>

              <div className="flex items-center gap-2 text-gray-700 text-sm mb-2">
                <FaCalendarAlt className="text-blue-500" />
                <span>
                  {formatDate(program.startDate)} → {formatDate(program.endDate)}
                </span>
              </div>

              <p className="font-semibold text-blue-600 text-sm">
                ⏳ {program.duration}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editMode ? 'Edit Program' : 'Create New Program'}
            </h3>

            <input
              type="text"
              name="name"
              placeholder="Program Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 mb-4">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditMode(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                {editMode ? 'Update' : 'Add Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBatch;
