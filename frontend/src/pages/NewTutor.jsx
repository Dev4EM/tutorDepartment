import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ Import Link
import { getAllUsers, createUser } from './../api';

const NewTutor = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

  const userType = user?.userType;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    password: '',
    role: 'tutor',
    batchId: null,
  });

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setTutors(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTutor = async (e) => {
    e.preventDefault();
    try {
      await createUser({ ...formData });
      setShowModal(false);
      fetchTutors();
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        password: '',
        role: 'tutor',
        batchId: null,
      });
    } catch (err) {
      alert(err.message || 'Failed to create tutor');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">All Tutors</h2>
       {userType==='admin'&&(<button
          className="px-6 py-2 bg-indigo-700 hover:bg-indigo-800 rounded-full text-white font-semibold"
          onClick={() => setShowModal(true)}
        >
          Add New
        </button>)} 
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4">Add New Tutor</h3>
            <form onSubmit={handleAddTutor} className="space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="email"
                name="workEmail"
                placeholder="Work Email"
                value={formData.workEmail}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <button
                type="submit"
                className="w-full bg-indigo-700 text-white py-2 rounded hover:bg-indigo-800"
              >
                Create Tutor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p className="text-center text-gray-600">Loading tutors...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : tutors.length === 0 ? (
        <p className="text-center text-gray-600">No tutors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {tutors.map((tutor) => (
            <Link
              key={tutor._id}
              to={`/tutordetails/${tutor._id}`} // ✅ Redirect on click
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center text-center cursor-pointer"
            >
              <img
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md mb-4"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  tutor.firstName + ' ' + tutor.lastName
                )}&background=4F46E5&color=fff&size=128`}
                alt={`${tutor.firstName} ${tutor.lastName}`}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {tutor.firstName} {tutor.lastName}
              </h3>
              <p className="text-indigo-600 font-medium text-sm mb-1">{tutor.workEmail}</p>
              <p className="text-gray-500 text-sm">
                Joined:{' '}
                {new Date(tutor.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <span className="mt-2 inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                {tutor.userType || tutor.role || 'N/A'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewTutor;
