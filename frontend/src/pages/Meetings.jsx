import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { MdAdd, MdSearch, MdEdit, MdDelete, MdContentCopy, MdVisibility } from "react-icons/md";
import AddMeetingModal from "../components/AddMeetingModal";
import EditMeetingModal from "../components/EditMeetingModal";
import { useNavigate } from "react-router-dom";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const navigate = useNavigate();

  const fetchMeetings = async () => {
  try {
    setLoading(true);
    const res = await api.get(`/meetings?page=${page}&limit=10&search=${search}`);
    setMeetings(res.data.data.data);
    setMeta(res.data.data.meta);
    } catch (err) {
    console.error(err);
    } finally {
    setLoading(false);
    }
  };    

  useEffect(() => {
    fetchMeetings();
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await api.delete(`/meetings/${id}`);
      fetchMeetings();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete meeting");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
          <p className="text-gray-400 mt-1">Manage class meetings and attendance codes</p>
        </div>
      </div>

      {/* Search + Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={handleSearch}
            className="outline-none text-sm text-gray-700 w-full"
          />
        </div>
        <div className="bg-purple-50 text-purple-600 px-4 py-2.5 rounded-xl text-sm font-medium">
          Total Meetings: {meta.total || 0}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <MdAdd size={18} /> New Meeting
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Class</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Teachers</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Date</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Students</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Attendance Code</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : meetings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">No meetings found</td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-medium text-gray-800">{meeting.class_name}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-600">{meeting.teacher_names || "No teachers assigned"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">
                    {new Date(meeting.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
                      {meeting.student_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-sm font-mono font-bold">
                        {meeting.attendance_code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(meeting.attendance_code)}
                        className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition"
                      >
                        <MdContentCopy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditMeeting(meeting)}
                        className="p-2 text-blue-500 hover:bg-blue-200 rounded-lg transition"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="p-2 text-red-500 hover:bg-red-200 rounded-lg transition"
                      >
                        <MdDelete size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/meetings/${meeting.id}`)}
                        className="p-2 text-green-500 hover:bg-green-200 rounded-lg transition"
                      >
                        <MdVisibility size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              disabled={page === meta.totalPages}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMeetingModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchMeetings}
        />
      )}
      {editMeeting && (
        <EditMeetingModal
          meeting={editMeeting}
          onClose={() => setEditMeeting(null)}
          onSuccess={fetchMeetings}
        />
      )}
    </Layout>
  );
};

export default Meetings;