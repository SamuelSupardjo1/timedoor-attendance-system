import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { MdArrowBack, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddLessonModal from "../components/AddLessonModal"; 
import EditLessonModal from "../components/EditLessonModal";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lessons?course_id=${id}&limit=100`);
      setLessons(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchLessons();
  }, [id]);

  const handleDelete = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      fetchLessons();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete lesson");
    }
  };

  return (
    <Layout>
      {/* Back button */}
      <button
        onClick={() => navigate("/courses")}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 transition"
      >
        <MdArrowBack size={18} /> Back to Courses
      </button>

      {/* Course Info */}
      {course && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{course.course_name}</h1>
              <p className="text-gray-400 mt-1">{course.description || "No description"}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium">
              {lessons.length} Lessons
            </div>
          </div>
        </div>
      )}

      {/* Lessons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Lessons</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <MdAdd size={16} /> Add Lesson
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Number</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Lesson Name</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : lessons.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">No lessons yet</td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-6   py-4 ">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                      {lesson.lesson_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {lesson.lesson_name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditLesson(lesson)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
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
      </div>

      {showAddModal && (
        <AddLessonModal
          courseId={id}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchLessons}
        />
      )}
      {editLesson && (
        <EditLessonModal
          lesson={editLesson}
          onClose={() => setEditLesson(null)}
          onSuccess={fetchLessons}
        />
      )}
    </Layout>
  );
};

export default CourseDetail;