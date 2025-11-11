import useUserAuthStore from "./stores/userAuthStore";

const API_BASE_URL = 'http://localhost:5000/api'; // Update if using a different backend URL

// Generic request function
const request = async (endpoint, method, data = null) => {
 const token=localStorage.getItem('token') 
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }) // ✅ Attach token if present
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || 'Something went wrong');
  }

  return resData;
};

// 🔐 Auth APIs
export const loginUser = async (credentials) => {
  return request('/users/login', 'POST', credentials);
};

export const getTutorDashboard = async (credentials) => {
  return request('/users/login', 'POST', credentials); // Possibly a duplicate of loginUser
};

export const signupUser = async (userData) => {
  return request('/auth/signup', 'POST', userData);
};

// 👥 Admin APIs

// Get all users
export const getAllUsers = async () => {
  return request('/admin/users', 'GET');
};

// Create a user
export const createUser = async (userData) => {
  return request('/admin/users/create', 'POST', userData);
};

// Assign a task
export const assignTask = async (taskData) => {
  return request('/admin/tasks/assign', 'POST', taskData);
};
export const getAllTask = async () => {
  return request('/admin/tasks', 'GET');
};
export const getAllTaskByID = async (id) => {
  return request(`/admin/tasks/${id}`, 'GET');
};
// Get user task statistics
export const getUserTaskStats = async () => {
  return request('/admin/tasks/stats', 'GET');
};

// Get all batches
export const getAllBatches = async () => {
  return request('/admin/batches', 'GET');
};

// Create a schedule
export const createSchedule = async (scheduleData) => {
  return request('/admin/schedule', 'POST', scheduleData);
};
export const createCurriculum = async (data) => {
  return request('/curriculum', 'POST', data);
};

export const getCurriculum = async () => {
  return request('/curriculum', 'GET' );
};
export const getCurriculumById = async (id) => {
  return request(`/curriculum/${id}`, 'GET' );
};
export const updateCurriculum = async (id,data) => {
  return request(`/curriculum/${id}`, 'PUT',data );
};
export const deleteCurriculum = async (id) => {
  return request(`/curriculum/${id}`, 'DELETE' );
};
// Create an alert
export const createAlert = async (alertData) => {
  return request('/admin/alerts', 'POST', alertData);
};
export const getUserDetailsAdmin = async (id) => {
  return request(`/admin/userDetails/${id}`, 'GET');
};
export const getProgram = async () => {
  return request('/programs', 'GET');
};
export const updateProgram = async () => {
  return request('/programs', 'GET');
};
export const deleteProgram = async () => {
  return request('/programs', 'GET');
};
export const getProgramById = async (id) => {
  return request(`/programs/${id}`, 'GET');
};
// getBatches, createBatch, updateBatch, deleteBatch,getCurriculums,getTutors
export const getBatches = async () => {
  return request('/batches', 'GET');
};
export const updateUserRole = async () => {
  return request('/batches', 'GET');
};
export const fetchBatchById = async (id) => {
  return request(`/batches/${id}`, 'GET');
};
export const getCurriculums = async () => {
  return request('/curriculum', 'GET');
};
export const getCurriculumsById = async (id) => {
  return request(`/curriculum/${id}`, 'GET');
};

export const getTutors = async () => {
  return request(`/users/tutors`, 'GET');
};
export const updateBatch = async (id,data) => {
  return request(`/batches/${id}`, 'PUT',data);
};
export const changeRoleUser = async (id,newRole) => {
  return request(`/admin/changeRole/${id}`, 'PUT',{newRole:newRole});
};

export const createBatch = async (alertData) => {
  return request('/batches', 'POST', alertData);
};
export const deleteBatch = async (id) => {
  return request(`/batches/${id}`, 'DELETE');
};
export const createProgram = async (programData) => {
  return request('/programs', 'POST', programData);
};
export const getAllAlerts = async () => {
  return request('/admin/alerts', 'GET');
};
