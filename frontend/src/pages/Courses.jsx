import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddCourseModal from "../components/AddCourseModal";
import EditCourseModal from "../components/EditCourseModal";

const Courses = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses?page=${page}&limit=10&search=${search}`);
      setCourses(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete course");
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-400 mt-1">Manage your courses and lessons</p>
        </div>
      </div>

      {/* Search + Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72">
          <MdSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={handleSearch}
            className="outline-none text-sm text-gray-700 w-full"
          />
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-medium">
          Total Courses: {meta.total || 0}
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <MdAdd size={18} /> Add Course
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Course</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Description</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">No courses found</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                        {course.course_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{course.course_name}</p>
                        <p className="text-xs text-gray-400">ID: #{course.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {course.description || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                      >
                        <MdVisibility size={16} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setEditCourse(course)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <MdDelete size={16} />
                          </button>
                        </>
                      )}
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

      {isAdmin && showAddModal && (
        <AddCourseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCourses}
        />
      )}
      {isAdmin && editCourse && (
        <EditCourseModal
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onSuccess={fetchCourses}
        />
      )}
    </Layout>
  );
};

export default Courses;