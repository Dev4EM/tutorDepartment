import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { getCurriculum, deleteCurriculum } from '../api'; // import deleteCurriculum
import { toast } from 'react-toastify';

const CurrActivity = () => {
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        setLoading(true);
        const data = await getCurriculum();
        setCurriculums(data);
      } catch (error) {
        console.error('Error fetching curriculums:', error);
        toast.error('❌ Failed to load curriculums.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculums();
  }, []);

  // Updated delete handler with API call
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this curriculum?')) {
      try {
        await deleteCurriculum(id); // Call API to delete from DB
        setCurriculums(curriculums.filter((item) => item._id !== id)); // Update state
        toast.success('✅ Curriculum deleted');
      } catch (error) {
        console.error('Error deleting curriculum:', error);
        toast.error('❌ Failed to delete curriculum.');
      }
    }
  };

  if (loading) return <div className="text-center mt-20">Loading curriculums...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="flex flex-row justify-between w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Curriculum Activities
        </h2>

        <button
          onClick={() => navigate('/create-curr')}
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Create Curriculum
        </button>
      </div>

      <div className="flex flex-wrap justify-start gap-6 w-full max-w-5xl">
        {curriculums.length === 0 ? (
          <p className="text-gray-500">No curriculums found.</p>
        ) : (
          curriculums.map((curr) => (
            <div
              key={curr._id}
              className="relative bg-white shadow-lg rounded-xl p-6 w-64 hover:shadow-2xl hover:-translate-y-2 transition-transform duration-300 group cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{curr.title}</h3>
              <p className="text-gray-500 text-sm mb-5">
                {curr.description ? curr.description : "No description available."}
              </p>

              <div className="absolute top-3 right-3 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaEdit
                  className="text-blue-600 hover:text-blue-800 text-lg"
                  onClick={() => navigate(`/edit-curr/${curr._id}`)}
                  title="Edit"
                />
                <FaTrash
                  className="text-red-600 hover:text-red-800 text-lg"
                  onClick={() => handleDelete(curr._id)}
                  title="Delete"
                />
              </div>

              <span className="absolute bottom-3 left-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {curr.category || "General"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CurrActivity;
