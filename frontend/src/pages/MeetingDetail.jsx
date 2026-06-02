import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdArrowBack, MdCheckCircle, MdCancel, MdAdd, MdRemoveRedEye } from "react-icons/md";
import AddFeedbackModal from "../components/AddFeedbackModal";

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudentFeedback, setSelectedStudentFeedback] = useState(null);

  const handleUpdateAttendance = async (attendanceId, newStatus) => {
    try {
      await api.put(`/attendance/${attendanceId}`, { status: newStatus });

      // update locally instead of re-fetching
      setAttendance((prev) =>
        prev.map((record) =>
          record.id === attendanceId
            ? { ...record, status: newStatus }
            : record
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await api.get(`/meeting-feedback?meeting_id=${id}&limit=100`);
      setFeedbacks(res.data.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeeting = async () => {
    try {
      const res = await api.get(`/meetings/${id}`);
      setMeeting(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance?meeting_id=${id}&limit=100`);
      setAttendance(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
    fetchAttendance();
    fetchFeedback();
  }, [id]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setCheckInLoading(true);
    setCheckInMessage(null);

    try {
      const res = await api.post("/attendance/check-in", {
        student_id: user.student_id,
        attendance_code: checkInCode,
      });
      setCheckInMessage({ type: "success", text: res.data.message });
      setCheckInCode("");
      fetchAttendance();
    } catch (err) {
      setCheckInMessage({
        type: "error",
        text: err.response?.data?.message || "Check-in failed",
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleStartMeeting = async () => {
    if (!confirm("Are you sure you want to start this meeting? This will generate attendance records for all students in the class.")) return;
    try {
      await api.post(`/meetings/${id}/start`);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start meeting");
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        {/* Back button */}
        <button
          onClick={() => navigate("/meetings")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition"
        >
          <MdArrowBack size={18} /> Back to Meetings
        </button>

        {(user?.role === "teacher" || user?.role === "admin") && attendance.length === 0 && (
          <button
            onClick={handleStartMeeting}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
          >
            Start Meeting (Generate Attendance)
          </button>
        )}
      </div>

      {/* Meeting Info */}
      {meeting && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{meeting.lesson_name}</h1>
              <p className="text-gray-400 mt-1">Lesson #{meeting.lesson_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Teacher</p>
              <p className="font-medium text-gray-800">{meeting.teacher_name}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(meeting.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl px-4 py-3">
              <p className="text-xs text-purple-400">Attendance Code</p>
              <p className="text-sm font-bold font-mono text-purple-600">{meeting.attendance_code}</p>
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-3">
              <p className="text-xs text-green-400">Present</p>
              <p className="text-sm font-bold text-green-600">
                {attendance.filter((a) => a.status === "present").length}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl px-4 py-3">
              <p className="text-xs text-red-400">Absent</p>
              <p className="text-sm font-bold text-red-500">
                {attendance.filter((a) => a.status === "absent").length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Check-in — students only */}
      {user?.role === "student" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Check In</h2>
          <form onSubmit={handleCheckIn} className="flex gap-3">
            <input
              type="text"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
              placeholder="Enter attendance code"
              required
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={checkInLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {checkInLoading ? "Checking in..." : "Check In"}
            </button>
          </form>
          {checkInMessage && (
            <div className={`mt-3 flex items-center gap-2 text-sm ${checkInMessage.type === "success" ? "text-green-600" : "text-red-500"
              }`}>
              {checkInMessage.type === "success"
                ? <MdCheckCircle size={18} />
                : <MdCancel size={18} />
              }
              {checkInMessage.text}
            </div>
          )}
        </div>
      )}

      {/* Attendance List */}
      <div className="flex gap-6 mt-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Attendance Records</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Student</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Time</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">No attendance records yet</td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                          {record.student_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800">{record.student_name}</p>
                          <p className="text-xs text-gray-400">{record.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(user?.role === "teacher" || user?.role === "admin") ? (
                        <button
                          onClick={() => handleUpdateAttendance(
                            record.id,
                            record.status === "present" ? "absent" : "present"
                          )}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition hover:opacity-70 ${record.status === "present"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                            }`}
                        >
                          {record.status}
                        </button>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === "present"
                            ? "bg-green-200 text-green-600"
                            : "bg-red-200 text-red-500"
                          }`}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {new Date(record.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const studentFeedback = feedbacks.find(
                          (f) => f.student_id === record.student_id
                        );
                        return studentFeedback ? (
                          <button
                            onClick={() => setSelectedStudentFeedback(studentFeedback)}
                            className="p-1.5 text-blue-500 hover:bg-blue-200 rounded-lg transition"
                          >
                            <MdRemoveRedEye size={16} />
                          </button>
                        ) : (user?.role === "teacher" || user?.role === "admin") ? (
                          <button
                            onClick={() => setShowFeedbackModal(true)}
                            className="p-1.5 text-green-500 hover:bg-green-200 rounded-lg transition"
                          >
                            <MdAdd size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">No feedback</span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <AddFeedbackModal
          meetingId={id}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={fetchFeedback}
        />
      )}

      {/* View Feedback Modal */}
      {selectedStudentFeedback && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Student Feedback</h2>
              <button
                onClick={() => setSelectedStudentFeedback(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MdCancel size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              "{selectedStudentFeedback.feedback}"
            </p>

            {selectedStudentFeedback.media_url && (
              <a
                href={selectedStudentFeedback.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline block mb-4"
              >
                View Media
              </a>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">S</div>
                <span className="text-xs text-gray-500">Student #{selectedStudentFeedback.student_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">T</div>
                <span className="text-xs text-gray-500">Teacher #{selectedStudentFeedback.teacher_id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MeetingDetail;