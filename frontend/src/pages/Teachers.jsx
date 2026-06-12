import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import AddTeacherModal from "../components/AddTeacherModal";
import EditTeacherModal from "../components/EditTeacherModal";
import { MdAdd, MdSearch, MdEdit, MdDelete } from "react-icons/md";
import { showAlert } from "../utils/alert";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

  const fetchTeachers = async () => {
    try {
        setLoading(true);
        const res = await api.get(`/teachers?page=${page}&limit=10&search=${search}`);
        setTeachers(res.data.data.data);
        setMeta(res.data.data.meta);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
   };

  useEffect(() => {
    fetchTeachers();
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id, user_id) => {
    const confirmResult = await showAlert.confirm("Are you sure?", "You want to delete this teacher?");
    if (!confirmResult.isConfirmed) return;
    try {
      await api.delete(`/teachers/${id}`);
      showAlert.success("Success", "Teacher deleted successfully");
      fetchTeachers();
    } catch (err) {
      showAlert.error("Error", err.response?.data?.message || "Cannot delete teacher");
    }
  };

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teachers Directory</h1>
          <p className="text-gray-400 mt-1">Manage your teachers and their courses</p>
        </div>
      </div>

      {/* Search + Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={search}
            onChange={handleSearch }
            className="outline-none text-sm text-gray-700 w-full"
          />
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-medium">
          Total Teachers: {meta.total || 0}
        </div>
                <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <MdAdd size={18} /> Add Teacher
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">No teachers found</td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {teacher.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
                        <p className="text-xs text-gray-400 text-left">ID: #{teacher.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">{teacher.email}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditTeacher(teacher)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id, teacher.user_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <MdDelete size={16} />
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
        <AddTeacherModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTeachers}
        />
      )}
      {editTeacher && (
        <EditTeacherModal
          teacher={editTeacher}
          onClose={() => setEditTeacher(null)}
          onSuccess={fetchTeachers}
        />
      )}
    </Layout>
  );
};

export default Teachers;