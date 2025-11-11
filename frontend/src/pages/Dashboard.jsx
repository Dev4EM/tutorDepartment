import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../components/AuthContext';
import { getTutorDashboard, getAllUsers,getAllTask,getCurriculum } from '../api';
import TaskCard from './TaskCard';
import SessionCard from './SessionCard';
import ScheduleCard from './ScheduleCard';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);

  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [curriculumCount, setCurriculumCount] = useState(0);

  useEffect(() => {
    if (user && token) {
      fetchDashboard();
      fetchUserCount();
      fetchTaskCount();
      fetchCurriculumCount();
    }
  }, [user, token]);

  const fetchUserCount = async () => {
    try {
      const res = await getAllUsers();
      setUserCount(res.length || 0);
    } catch (err) {
      console.error('Error fetching user count:', err);
    }
  };
  const fetchTaskCount = async () => {
    try {
      const res = await getAllTask();
      setTaskCount(res.length || 0);
    } catch (err) {
      console.error('Error fetching user count:', err);
    }
  };
  const fetchCurriculumCount = async () => {
    try {
      const res = await getCurriculum();
      setCurriculumCount(res.length || 0);
    } catch (err) {
      console.error('Error fetching curriculum count:', err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await getTutorDashboard(user.id, token);
      setSessions(data.sessions || []);
      setTasks(data.tasks || []);
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600 text-lg">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white font-josefin rounded-md shadow min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome back, {user?.firstName || 'Tutor'}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-sm text-gray-500 mb-2">Total Tutors</h2>
          <p className="text-3xl font-bold text-blue-600">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-sm text-gray-500 mb-2">Total Tasks</h2>
          <p className="text-3xl font-bold text-green-600">{taskCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-sm text-gray-500 mb-2">Total Curriculums</h2>
          <p className="text-3xl font-bold text-purple-600">{curriculumCount}</p>
        </div>
      </div>

      {/* Sessions Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📅 Upcoming Sessions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionCard key={session._id} session={session} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No upcoming sessions.</p>
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📝 Your Current Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task._id} task={task} />)
          ) : (
            <p className="text-gray-500 col-span-full">
              No active tasks at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Schedule Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 PTM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.length > 0 ? (
            schedule.map((item) => (
              <ScheduleCard key={item._id} item={item} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">
              No upcoming events scheduled.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
