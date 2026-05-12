import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittedCodes, setSubmittedCodes] = useState({});
  const [codeInput, setCodeInput] = useState({});
  const [studentId, setStudentId] = useState(null);

  // Fetch student ID on component mount
  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const res = await api.get(`/students/me`);
        const currentStudent = res.data.data;
        if (currentStudent) {
          setStudentId(currentStudent.id);
        } else {
          setError("Student record not found. Please contact administrator.");
        }
      } catch (err) {
        console.error("Error fetching student ID:", err);
        const errorMessage = err.response?.data?.message || "Failed to load student information";
        setError(errorMessage);
      }
    };

    if (user?.id) {
      fetchStudentId();
    }
  }, [user?.id]);

  // Fetch active meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/attendance/student/${studentId}/meetings`);
        const meetingsData = res.data.data || [];
        setMeetings(meetingsData);

        // Initialize submitted codes state
        const codes = {};
        meetingsData.forEach(m => {
          if (m.code_submitted) {
            codes[m.meeting_id] = { code: m.code_submitted, status: m.approval_status };
          }
        });
        setSubmittedCodes(codes);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [studentId]);

  const handleCodeChange = (meetingId, value) => {
    // Only allow digits, max 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setCodeInput(prev => ({ ...prev, [meetingId]: value }));
    }
  };

  const handleSubmitCode = async (meetingId) => {
    // Security validation: Ensure studentId is set
    if (!studentId) {
      alert("Student ID not found. Please refresh and try again.");
      return;
    }

    const code = codeInput[meetingId];
    if (!code || code.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    // Validate that the meeting exists in the current student's meetings
    const meeting = meetings.find(m => m.meeting_id === meetingId);
    if (!meeting) {
      alert("Invalid meeting selected");
      return;
    }

    try {
      const res = await api.post("/attendance/submit-code", {
        student_id: studentId,
        meeting_id: meetingId,
        code: code
      });

      setSubmittedCodes(prev => ({
        ...prev,
        [meetingId]: { code: code, status: 'pending' }
      }));

      setCodeInput(prev => ({ ...prev, [meetingId]: '' }));
      alert("Code submitted successfully! Waiting for teacher approval.");
    } catch (err) {
      console.error("Error submitting code:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit code. Please try again.";
      alert(errorMessage);
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '?';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-green-500">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Mark your attendance for your classes</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
          <p className="text-slate-500 font-medium">Loading meetings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl p-8 shadow-sm border border-red-200">
          <p className="text-red-600 font-semibold text-center text-lg">⚠️ {error}</p>
        </div>
      ) : meetings && meetings.length > 0 ? (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 shadow-lg text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">Mark Your Presence</h2>
            <p className="text-green-100">Enter the 6-digit code provided by your teacher to mark attendance</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {meetings.map((meeting) => (
              <div key={meeting.meeting_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Meeting Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{meeting.class_name}</h3>
                    <p className="text-gray-500 text-sm">{meeting.lesson_name}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-semibold text-lg border-2 ${getApprovalStatusColor(submittedCodes[meeting.meeting_id]?.status || 'not_submitted')}`}>
                    {submittedCodes[meeting.meeting_id] ? (
                      <>
                        <span>{getApprovalStatusIcon(submittedCodes[meeting.meeting_id].status)}</span>
                        <span className="ml-2 capitalize">{submittedCodes[meeting.meeting_id].status}</span>
                      </>
                    ) : (
                      <>
                        <span>○</span>
                        <span className="ml-2">Not Submitted</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Code Input Section */}
                {!submittedCodes[meeting.meeting_id] ? (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enter 6-Digit Attendance Code
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={codeInput[meeting.meeting_id] || ''}
                          onChange={(e) => handleCodeChange(meeting.meeting_id, e.target.value)}
                          placeholder="000000"
                          maxLength="6"
                          className="flex-1 px-4 py-3 text-2xl text-center tracking-widest border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 font-mono"
                        />
                        <button
                          onClick={() => handleSubmitCode(meeting.meeting_id)}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      Ask your teacher for the attendance code to mark your presence
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Code Submitted</p>
                        <p className="text-2xl font-mono font-bold text-gray-800">{submittedCodes[meeting.meeting_id].code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="text-lg font-semibold capitalize">
                          {submittedCodes[meeting.meeting_id].status === 'pending' && '⏳ Waiting for Approval'}
                          {submittedCodes[meeting.meeting_id].status === 'approved' && '✓ Approved'}
                          {submittedCodes[meeting.meeting_id].status === 'rejected' && '✗ Rejected'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-600 font-medium text-lg">No active meetings</p>
          <p className="text-slate-500 text-sm mt-2">Check back when your class has a scheduled meeting</p>
        </div>
      )}
    </Layout>
  );
};

export default StudentDashboard;
