import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { MdMeetingRoom, MdPeople, MdMenuBook } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

// Admin Dashboard
const AdminDashboard = ({ stats, user }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.students} color="text-green-500" />
        <StatCard label="Total Teachers" value={stats.teachers} color="text-blue-500" />
        <StatCard label="Total Meetings" value={stats.meetings} color="text-purple-500" />
        <StatCard label="Total Courses" value={stats.courses} color="text-orange-500" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Add Student", path: "/students", icon: <PiStudentFill size={18}/> , color: "bg-green-50 text-green-600" },
            { label: "Add Teacher", path: "/teachers", icon: <MdPeople size={18}/>, color: "bg-blue-50 text-blue-600" },
            { label: "New Meeting", path: "/meetings", icon: <MdMeetingRoom size={18}/>, color: "bg-purple-50 text-purple-600" },
            { label: "Add Course", path: "/courses", icon: <MdMenuBook size={18}/>, color: "bg-orange-50 text-orange-600" },
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
    </>
  );
};

// Parent Dashboard
const ParentDashboard = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch parent's students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setError(null);
        const studentsRes = await api.get("/students");
        const allStudents = studentsRes.data.data || [];
        
        // Filter students that belong to this parent (parent_id matches user.id)
        const parentStudents = allStudents.filter(s => s.parent_id === user?.id);
        
        console.log("Parent ID:", user?.id);
        console.log("All students:", allStudents);
        console.log("Parent's students:", parentStudents);
        
        setStudents(parentStudents);
        
        if (parentStudents.length > 0) {
          setSelectedStudentId(parentStudents[0].id);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load student information");
      }
    };

    if (user?.id) {
      fetchStudents();
    }
  }, [user?.id]);

  // Fetch current lesson for selected student
  useEffect(() => {
    const fetchCurrentLesson = async () => {
      if (!selectedStudentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const attendanceRes = await api.get("/attendance?limit=100");
        const attendance = attendanceRes.data.data || [];

        // Filter attendance for this specific student
        const studentAttendance = attendance.filter(a => a.student_id === selectedStudentId);

        console.log("Student ID:", selectedStudentId);
        console.log("All attendance:", attendance);
        console.log("Student attendance:", studentAttendance);

        if (studentAttendance.length > 0) {
          // Get the most recent attendance record for this student
          const latestAttendance = studentAttendance[0];
          const selectedStudent = students.find(s => s.id === selectedStudentId);

          console.log("Latest attendance:", latestAttendance);

          setCurrentLesson({
            class_name: latestAttendance.class_name || "Class",
            lesson_name: latestAttendance.lesson_name || "Current Lesson",
            lesson_number: latestAttendance.lesson_number || "--",
            course_name: latestAttendance.course_name || "No Course",
            lesson_status: latestAttendance.lesson_status || "not_started",
            attendance_status: latestAttendance.status,
            student_name: selectedStudent?.name || "Student",
            teacher_name: latestAttendance.teacher_name || "TBA",
          });
        } else {
          setError("No attendance records for this student");
        }
      } catch (err) {
        console.error("Error fetching current lesson:", err);
        setError(err.message || "Failed to load lesson information");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentLesson();
  }, [selectedStudentId, students]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      {/* Student Selector */}
      {students.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-3 font-semibold">Select a child to view their progress:</p>
          <div className="flex flex-wrap gap-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStudentId === student.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                }`}
              >
                👤 {student.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Information */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-orange-50 rounded-2xl p-8 shadow-sm border border-orange-200 text-center">
          <p className="text-orange-600 font-medium">{error}</p>
        </div>
      ) : currentLesson ? (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-sm border border-green-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-2">📚 {currentLesson.class_name}</p>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{currentLesson.lesson_name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentLesson.lesson_status === 'completed'
                    ? 'bg-green-200 text-green-800'
                    : currentLesson.lesson_status === 'in_progress'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {currentLesson.lesson_status === 'completed' ? '✓ Completed' : currentLesson.lesson_status === 'in_progress' ? '🔄 In Progress' : 'Not Started'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{currentLesson.course_name}</p>
              <p className="text-xs text-gray-500 mt-2">Student: <span className="font-semibold text-gray-700">{currentLesson.student_name}</span></p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentLesson.attendance_status === 'present' 
                ? 'bg-green-500 text-white' 
                : currentLesson.attendance_status === 'absent' 
                ? 'bg-red-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
              {currentLesson.attendance_status === 'present' ? '✓ Present' : currentLesson.attendance_status === 'absent' ? '✗ Absent' : '⏳ Not Marked'}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">LESSON NUMBER</p>
              <p className="text-2xl font-bold text-blue-600">#{currentLesson.lesson_number}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">COURSE</p>
              <p className="text-lg font-semibold text-gray-800">{currentLesson.course_name}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">TEACHER</p>
              <p className="text-lg font-semibold text-gray-800">{currentLesson.teacher_name}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-green-200">
            <p className="text-sm text-gray-600">
              {currentLesson.attendance_status === 'present' 
                ? '✅ Your child attended this weeks lesson successfully!' 
                : currentLesson.attendance_status === 'absent'
                ? '⚠️ Your child was marked absent from this weeks lesson.'
                : '📋 Attendance status pending...'}
            </p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">No students linked to your account</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">No lesson information available</p>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    meetings: 0,
    courses: 0,
  });

  useEffect(() => {
    if (user?.role === "admin") {
      const fetchStats = async () => {
        try {
          const [students, teachers, meetings, courses] = await Promise.all([
            api.get("/students?limit=1"),
            api.get("/teachers?limit=1"),
            api.get("/meetings?limit=1"),
            api.get("/courses?limit=1"),
          ]);

          setStats({
            students: students.data.meta.total,
            teachers: teachers.data.meta.total,
            meetings: meetings.data.meta.total,
            courses: courses.data.meta.total,
          });
        } catch (err) {
          console.error(err);
        }
      };

      fetchStats();
    }
  }, [user]);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-green-500">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {user?.role === "parent" ? "Here's your child's learning progress" : "Here's what's happening today"}
        </p>
      </div>

      {/* Role-based Dashboard Content */}
      {user?.role === "admin" ? (
        <AdminDashboard stats={stats} user={user} />
      ) : user?.role === "parent" ? (
        <ParentDashboard user={user} />
      ) : null}
    </Layout>
  );
};

export default Dashboard;