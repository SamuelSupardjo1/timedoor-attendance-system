import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Students from "./pages/Student";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Meetings from "./pages/Meetings";
import MeetingDetail from "./pages/MeetingDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
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
          <ProtectedRoute roles={["admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Classes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <Meetings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route
        path="/meetings/:id"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <MeetingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}

export default App;