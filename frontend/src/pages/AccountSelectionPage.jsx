import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "./../api";

const AccountSelectionPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    navigate(`/add-schedule/${userId}`); // ✅ Go to details page
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">

      <h1 className="text-3xl font-bold mb-8">Select A Schedule</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading accounts...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user._id)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center text-center cursor-pointer"
            >
              <img
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md mb-4"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.firstName + " " + user.lastName
                )}&background=4F46E5&color=fff&size=128`}
                alt={`${user.firstName} ${user.lastName}`}
              />

              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h3>

              <p className="text-indigo-600 font-medium text-sm mb-1">
                {user.workEmail}
              </p>

              <span className="mt-2 inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                {user.userType || "User"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountSelectionPage;
