import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Students from "./pages/Student";
import Teachers from "./pages/Teachers";
import Meetings from "./pages/Meetings";
import MeetingDetail from "./pages/MeetingDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div>Access Denied</div>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute roles={["admin", "teacher", "parent"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute roles={["admin", "teacher", "student", "parent"]}>
            <Meetings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route
        path="/meetings/:id"
        element={
          <ProtectedRoute roles={["admin", "teacher", "student", "parent"]}>
            <MeetingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}

export default App;