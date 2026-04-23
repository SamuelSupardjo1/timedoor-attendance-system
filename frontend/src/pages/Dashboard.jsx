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
        const studentsRes = await api.get("/students", {
          params: {
            parent_id: user?.id,
            limit: 100
          }
        });
        const parentStudents = studentsRes.data.data || [];
        
        console.log("Parent ID:", user?.id);
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

          // Fetch lessons to get total lesson count for the course
          let maxLessonNumber = "--";
          try {
            const lessonsRes = await api.get("/lessons?limit=1000");
            const lessons = lessonsRes.data.data || [];
            // Find lessons for this course and get the max lesson number
            const courseLessons = lessons.filter(l => l.course_name === latestAttendance.course_name || l.course_id === latestAttendance.course_id);
            if (courseLessons.length > 0) {
              maxLessonNumber = Math.max(...courseLessons.map(l => l.lesson_number || 0));
            }
          } catch (err) {
            console.error("Error fetching lessons:", err);
          }

          const currentLessonNumber = latestAttendance.lesson_number || "--";
          const lessonProgress = maxLessonNumber !== "--" ? `${currentLessonNumber} / ${maxLessonNumber}` : currentLessonNumber;

          setCurrentLesson({
            class_name: latestAttendance.class_name || "Class",
            lesson_name: latestAttendance.lesson_name || "Current Lesson",
            lesson_number: currentLessonNumber,
            lesson_progress: lessonProgress,
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 shadow-lg mb-8 text-white">
          <p className="text-white font-semibold mb-4 flex items-center gap-2">
            Select a child to view their progress
          </p>
          <div className="flex flex-wrap gap-3">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all duration-200 ${
                  selectedStudentId === student.id
                    ? 'bg-white text-slate-700 shadow-lg scale-105'
                    : 'bg-white/15 text-white backdrop-blur-sm border border-white/30 hover:bg-white/25'
                }`}
              >
                <PiStudentFill size={20}/> {student.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Information */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
          <p className="text-slate-500 font-medium">Loading lesson information...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl p-8 shadow-sm border border-red-200">
          <p className="text-red-600 font-semibold text-center text-lg">⚠️ {error}</p>
        </div>
      ) : currentLesson ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-semibold mb-1">Currently Learning</p>
                <h2 className="text-4xl font-bold">{currentLesson.lesson_name}</h2>
              </div>
              <div className={`px-6 py-3 rounded-2xl font-bold text-lg ${
                currentLesson.attendance_status === 'present' 
                  ? 'bg-emerald-500 text-white' 
                  : currentLesson.attendance_status === 'absent' 
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {currentLesson.attendance_status === 'present' ? '✓ Present' : currentLesson.attendance_status === 'absent' ? '✗ Absent' : '⏳ Not Marked'}
              </div>
            </div>
            <p className="text-blue-50">{currentLesson.course_name}</p>
          </div>

          {/* Student & Class Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Student</p>
              <p className="text-2xl font-bold text-slate-800">{currentLesson.student_name}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Class</p>
              <p className="text-2xl font-bold text-slate-800">{currentLesson.class_name}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Teacher</p>
              <p className="text-2xl font-bold text-slate-800">{currentLesson.teacher_name}</p>
            </div>
          </div>

          {/* Progress & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase">Lesson Progress</p>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-800">{currentLesson.lesson_progress}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase">Lesson Status</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-800">
                  {currentLesson.lesson_status === 'completed' ? '✓ Completed' : currentLesson.lesson_status === 'in_progress' ? 'In Progress' : 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-slate-600 font-medium text-lg">No students linked to your account</p>
          <p className="text-slate-500 text-sm mt-2">Contact your administrator to add students</p>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-600 font-medium text-lg">No lesson information available</p>
          <p className="text-slate-500 text-sm mt-2">Lessons will appear once they are assigned</p>
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