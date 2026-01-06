import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedLayout from './components/ProtectedLayout';
import AuthContext, { AuthProvider } from './components/AuthContext';
import { useContext } from 'react';
import DailyBatch from './pages/DailyBatch';
import AddTask from './pages/AddTask';
import AddSheet from './pages/AddSheet';
import AssignTask from './pages/AssignTask';
import CurrActivity from './pages/CurrActivity';
import NewTutor from './pages/NewTutor';
import ViewCurr from './pages/ViewCurr';
import CreateCurriculum from './pages/CreateCurriculum';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditCurriculum from './pages/EditCurriculum';
import BatchDetail from './pages/BatchDetail';
import TutorDetails from './pages/TutorDetails';
import SchedulePage from './pages/SchedulePage';
import AccountSelectionPage from './pages/AccountSelectionPage';
import AdminDashboard from './components/AdminDashboard';
import ForgetPassword from './pages/ForgetPassword';


// 🔐 Protect specific routes
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

// 📦 Main route definitions
function LayoutRoutes() {
  return (
    <Routes >
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes - Nested under layout */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route path="dashboard" element={<ProtectedRoute> <Dashboard />  </ProtectedRoute>} />
        <Route path="daily-batch" element={<ProtectedRoute> <DailyBatch />  </ProtectedRoute>} />
        <Route path="add-task" element={<ProtectedRoute>    <AddTask />  </ProtectedRoute>} />
        <Route path="add-schedule" element={<ProtectedRoute>    <SchedulePage />  </ProtectedRoute>} />
        <Route path="add-schedule/:id" element={<ProtectedRoute>    <AdminDashboard />  </ProtectedRoute>} />
        <Route path="add-sheet" element={<ProtectedRoute>    <AddSheet />  </ProtectedRoute>} />
        <Route path="assign-task" element={<ProtectedRoute>    <AssignTask />  </ProtectedRoute>} />
        <Route path="curr-activity" element={<ProtectedRoute>    <CurrActivity />  </ProtectedRoute>} />
        <Route path="new-tutor" element={<ProtectedRoute>    <NewTutor />  </ProtectedRoute>} />
        <Route path="view-curr" element={<ProtectedRoute>    <ViewCurr />  </ProtectedRoute>} />
        <Route path="create-curr" element={<ProtectedRoute>    <CreateCurriculum />  </ProtectedRoute>} />
        <Route path="edit-curr/:id" element={<ProtectedRoute><EditCurriculum /></ProtectedRoute>} />
        <Route path="batch/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
        <Route path="tutordetails/:id" element={<ProtectedRoute><TutorDetails /></ProtectedRoute>} />
        <Route path="tutor/forget-pass" element={<ProtectedRoute><ForgetPassword /></ProtectedRoute>} />

{/* <Route  path="logout" element={  <ProtectedRoute>    <Logout />  </ProtectedRoute>  }/>   */}




      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider >
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <LayoutRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
