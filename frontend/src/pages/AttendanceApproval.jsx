import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { MdCheckCircle, MdCancel } from "react-icons/md";

const AttendanceApproval = () => {
  const { user } = useAuth();
  const [pendingAttendance, setPendingAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [teacherId, setTeacherId] = useState(null);

  // Get teacher ID from user profile
  useEffect(() => {
    const fetchTeacherId = async () => {
      try {
        // Get teacher profile for the current user
        const res = await api.get("/teachers/me");
        const teacherData = res.data.data;
        
        setTeacherId(teacherData.id);
      } catch (err) {
        console.error("Error fetching teacher profile:", err);
      }
    };

    if (user?.id) {
      fetchTeacherId();
    }
  }, [user?.id]);

  // Fetch pending attendance
  useEffect(() => {
    const fetchPendingAttendance = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/attendance/teacher/${teacherId}/pending`, {
          params: { page, limit: 10 }
        });
        const data = res.data.data.data || [];
        setPendingAttendance(data);
        setTotalPages(res.data.data.meta?.totalPages || 1);
      } catch (err) {
        console.error("Error fetching pending attendance:", err);
        setError("Failed to load pending attendance records");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAttendance();
  }, [teacherId, page]);

  const handleApprove = async (attendanceId) => {
    try {
      setApproving(prev => ({ ...prev, [attendanceId]: true }));
      await api.put(`/attendance/${attendanceId}/approve`, { approved: true });
      
      // Remove from list
      setPendingAttendance(prev => prev.filter(a => a.id !== attendanceId));
    } catch (err) {
      console.error("Error approving attendance:", err);
      setError(`Failed to approve: ${err.response?.data?.message || err.message}`);
    } finally {
      setApproving(prev => ({ ...prev, [attendanceId]: false }));
    }
  };

  const handleReject = async (attendanceId) => {
    try {
      setApproving(prev => ({ ...prev, [attendanceId]: true }));
      await api.put(`/attendance/${attendanceId}/approve`, { approved: false });
      
      // Remove from list
      setPendingAttendance(prev => prev.filter(a => a.id !== attendanceId));
    } catch (err) {
      console.error("Error rejecting attendance:", err);
      setError(`Failed to reject: ${err.response?.data?.message || err.message}`);
    } finally {
      setApproving(prev => ({ ...prev, [attendanceId]: false }));
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const normalizeCode = (code) => {
    // Convert to string and trim whitespace
    if (!code) return '';
    return String(code).trim().toUpperCase();
  };

  const codesMatch = (submitted, correct) => {
    const norm1 = normalizeCode(submitted);
    const norm2 = normalizeCode(correct);
    
    // Direct match
    if (norm1 === norm2) return true;
    
    // If one is numeric and other is not, they don't match
    // (students submit numbers, attendance_code is alphanumeric)
    return false;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Approval</h1>
        <p className="text-gray-400 mt-1">Review and approve student attendance code submissions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
          <p className="text-gray-500 font-medium">Loading pending attendance...</p>
        </div>
      ) : pendingAttendance.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-gray-600 font-medium text-lg">No pending attendance</p>
          <p className="text-gray-400 text-sm mt-2">All student submissions have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Attendance Records */}
          {pendingAttendance.map((record) => (
            <div 
              key={record.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center mb-4">
                {/* Student Name */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Student</p>
                  <p className="text-lg font-bold text-gray-800">{record.student_name}</p>
                  <p className="text-sm text-gray-400">{record.student_email}</p>
                </div>

                {/* Class Info */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Class</p>
                  <p className="text-lg font-bold text-gray-800">{record.class_name}</p>
                  <p className="text-sm text-gray-400">{record.lesson_name}</p>
                </div>

                {/* Submitted Code */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Submitted Code</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-blue-600 tracking-wider">{record.code_submitted}</p>
                    <p className="text-xs text-gray-400">vs {record.attendance_code}</p>
                  </div>
                </div>

                {/* Submission Time */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Submitted</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(record.submitted_at)}</p>
                </div>

                {/* Status Badge */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Status</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                    Pending Review
                  </span>
                </div>
              </div>

              {/* Code Match Alert */}
              {codesMatch(record.code_submitted, record.attendance_code) ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-green-700 text-sm font-medium">Code matches - attendance verified</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                  <span className="text-orange-600">⚠</span>
                  <p className="text-orange-700 text-sm font-medium">
                    Code mismatch: "{record.code_submitted}" vs "{record.attendance_code}" - verify manually
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleReject(record.id)}
                  disabled={approving[record.id]}
                  className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <MdCancel size={18} />
                  {approving[record.id] ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(record.id)}
                  disabled={approving[record.id]}
                  className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <MdCheckCircle size={18} />
                  {approving[record.id] ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-green-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default AttendanceApproval;
