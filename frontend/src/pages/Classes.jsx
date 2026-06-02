import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddClassModal from "../components/AddClassModal";
import EditClassModal from "../components/EditClassModal";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes?page=${page}&limit=10&search=${search}`);
      setClasses(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete class");
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Classes</h1>
          <p className="text-gray-400 mt-1">Manage classes and assign students and teachers</p>
        </div>
      </div>

      {/* Search + Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={handleSearch}
            className="outline-none text-sm text-gray-700 w-full"
          />
        </div>
        <div className="bg-orange-50 text-orange-600 px-4 py-2.5 rounded-xl text-sm font-medium">
          Total Classes: {meta.total || 0}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <MdAdd size={18} /> New Class
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Class Name</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Description</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Students</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Teachers</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">No classes found</td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                        {cls.class_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{cls.class_name}</p>
                        <p className="text-xs text-gray-400">ID: #{cls.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {cls.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
                      {cls.student_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-sm font-medium">
                      {cls.teacher_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditClass(cls)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Edit class and manage members"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete class"
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

      {showAddModal && (
        <AddClassModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchClasses}
        />
      )}
      {editClass && (
        <EditClassModal
          classData={editClass}
          onClose={() => setEditClass(null)}
          onSuccess={fetchClasses}
        />
      )}
    </Layout>
  );
};

export default Classes;
