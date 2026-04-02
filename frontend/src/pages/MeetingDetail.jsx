import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdArrowBack, MdCheckCircle, MdCancel } from "react-icons/md";

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
      setAttendance(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
    fetchAttendance();
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

  return (
    <Layout>
      {/* Back button */}
      <button
        onClick={() => navigate("/meetings")}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 transition"
      >
        <MdArrowBack size={18} /> Back to Meetings
      </button>

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
            <div className={`mt-3 flex items-center gap-2 text-sm ${
              checkInMessage.type === "success" ? "text-green-600" : "text-red-500"
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Attendance Records</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Student</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">No attendance records yet</td>
              </tr>
            ) : (
              attendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                        {record.student}
                      </div>
                      <p className="text-sm font-medium text-gray-800">Student #{record.student}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === "present"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default MeetingDetail;