import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import ParentDashboard from "./ParentDashboard";
import TeacherDashboard from "./TeacherDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  // Render appropriate dashboard based on user role
  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;