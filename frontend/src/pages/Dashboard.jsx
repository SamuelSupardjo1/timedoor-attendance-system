import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { MdMeetingRoom, MdPeople, MdFeedback, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    meetings: 0,
    attendance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, teachers, meetings, attendance] = await Promise.all([
          api.get("/students?limit=1"),
          api.get("/teachers?limit=1"),
          api.get("/meetings?limit=1"),
          api.get("/attendance?limit=1"),
        ]);

        setStats({
          students: students.data.meta.total,
          teachers: teachers.data.meta.total,
          meetings: meetings.data.meta.total,
          attendance: attendance.data.meta.total,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-green-500">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's what's happening today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.students} color="text-green-500" />
        <StatCard label="Total Teachers" value={stats.teachers} color="text-blue-500" />
        <StatCard label="Total Meetings" value={stats.meetings} color="text-purple-500" />
        <StatCard label="Attendance Records" value={stats.attendance} color="text-orange-500" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Add Student", path: "/students", icon: <MdPeople size={18}/> , color: "bg-green-50 text-green-600" },
            { label: "Add Teacher", path: "/teachers", icon: <MdPeople size={18}/>, color: "bg-blue-50 text-blue-600" },
            { label: "New Meeting", path: "/meetings", icon: <MdMeetingRoom size={18}/>, color: "bg-purple-50 text-purple-600" },
            { label: "View Reports", path: "/reports", icon: <MdFeedback size={18}/>, color: "bg-orange-50 text-orange-600" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.color} rounded-xl p-4 flex flex-col items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md`}
            >
              <span className="text-2xl">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;