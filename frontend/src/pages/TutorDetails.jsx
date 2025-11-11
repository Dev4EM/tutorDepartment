import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getUserDetailsAdmin, changeRoleUser } from "../api";
import AuthContext from "../components/AuthContext";
import { toast } from "react-toastify";

const TutorDetails = () => {
  const { token, user: loggedInUser } = useContext(AuthContext);
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const { id: userId } = useParams();

  const fetchDetails = async () => {
    try {
      if (!token) throw new Error("Unauthorized");
      const data = await getUserDetailsAdmin(userId, token);
      setTutorData(data);
      setSelectedRole(data?.user?.userType || "");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tutor details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDetails();
  }, [userId]);

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    try {
      await changeRoleUser(userId, newRole,token);
      setTutorData((prev) => ({
        ...prev,
        user: { ...prev.user, userType: newRole },
      }))
  toast.success(`Role updated successfully to "${newRole}" 🎉`);
    } catch (err) {
      console.error("Failed to update role:", err);
      setError("Failed to update role.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading tutor details...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );

  if (!tutorData)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        No tutor data found.
      </div>
    );

  const { user, stats, batches } = tutorData;

  return (
    <div className="w-full min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
            Tutor Details
          </h2>

          {loggedInUser?.userType === "admin" && (
            <div className="flex items-center space-x-3">
              <label htmlFor="role" className="text-gray-700 font-medium">
                Change Role:
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={handleRoleChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="tutor">Tutor</option>
                <option value="teamLeader">Team Leader</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="Curriculums Created" value={stats?.curriculumCount} />
          <StatCard title="Batches Assigned" value={stats?.assignedBatchesCount} />
          <StatCard
            title="Ongoing Batch"
            value={
              stats?.ongoingBatch?.name
                ? stats.ongoingBatch.name
                : "N/A"
            }
          />
          <StatCard title="Pending Tasks" value={stats?.pendingTasksCount} />
        </div>

        {/* Personal Info */}
        <div className="border-t pt-6 mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {`${user?.firstName || ""} ${user?.lastName || ""}`}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.workEmail}
            </p>
            <p>
              <span className="font-medium">User Type:</span> {user?.userType}
            </p>
            <p>
              <span className="font-medium">Employment Status:</span>{" "}
              {user?.employmentStatus || "N/A"}
            </p>
            <p>
              <span className="font-medium">Created At:</span>{" "}
              {new Date(user?.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Updated At:</span>{" "}
              {new Date(user?.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Assigned & Past Batches */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Batch Assignments & History
          </h3>

          {batches && batches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full  border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2  text-sm font-semibold text-gray-700">
                      Batch Name
                    </th>
                    <th className="px-4 py-2  text-sm font-semibold text-gray-700">
                      Curriculum
                    </th>
                   
                    <th className="px-4 py-2  text-sm font-semibold text-gray-700">
                      Start Date
                    </th>
                    <th className="px-4 py-2  text-sm font-semibold text-gray-700">
                      End Date
                    </th>
                   
                   
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-4 py-3">{batch.name}</td>
                      <td className="px-4 py-3">
                        {batch.curriculum?.title || "N/A"}
                      </td>
                     
                      <td className="px-4 py-3">
                        {new Date(batch.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(batch.endDate).toLocaleDateString()}
                      </td>
                    
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No batch assignments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Small stat box component
const StatCard = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
    <h4 className="text-gray-600 font-medium mb-2">{title}</h4>
    <p className="text-2xl font-bold text-gray-800">{value || 0}</p>
  </div>
);

export default TutorDetails;
