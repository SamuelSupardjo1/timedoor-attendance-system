import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { MdAdd, MdSearch, MdEdit, MdDelete } from "react-icons/md";
import EditStudentModal from "../components/EditStudentModal";
import AddStudentModal from "../components/AddStudentModal";
import { showAlert } from "../utils/alert";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students?page=${page}&limit=10&search=${search}`);
      setStudents(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    const confirmResult = await showAlert.confirm("Are you sure?", "You want to delete this student?");
    if (!confirmResult.isConfirmed) return;
    try {
        await api.delete(`/students/${id}`);
        showAlert.success("Success", "Student deleted successfully");
        fetchStudents();
    } catch (err) {
        showAlert.error("Error", err.response?.data?.message || "Cannot delete student");
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students Directory</h1>
          <p className="text-gray-400 mt-1">Manage your active roster and track attendance</p>
        </div>
      </div>

      {/* Search + Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={handleSearch}
            className="outline-none text-sm text-gray-700 w-full"
          />
        </div>
        <div className="bg-green-50 text-green-600 px-4 py-2.5 rounded-xl text-sm font-medium">
          Total Students: {meta.total || 0}
        </div>
        <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto flex gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
            <MdAdd size={18} /> Add Student
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Student</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Parent</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">No students found</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-400 text-left">ID: #{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">{student.parent_name || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditStudent(student)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
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
      {editStudent && (
        <EditStudentModal
            student={editStudent}
            onClose={() => setEditStudent(null)}
            onSuccess={fetchStudents}
        />
      )}
      {showAddModal && (
        <AddStudentModal
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchStudents}
        />
      )}
    </Layout>
  );
};

export default Students;