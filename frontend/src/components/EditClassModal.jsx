import { useState, useEffect } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import api from "../api/axios";

const EditClassModal = ({ classData, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classDetails, setClassDetails] = useState(null);

  useEffect(() => {
    if (classData) {
      setClassName(classData.class_name);
      setDescription(classData.description || "");
      setClassDetails(classData);
      fetchClassMembers();
      fetchAvailableMembers();
    }
  }, [classData]);

  const fetchClassMembers = async () => {
    try {
      const studentsRes = await api.get(`/classes/${classData.id}/students`);
      setClassStudents(studentsRes.data || []);
    } catch (err) {
      console.error("Error fetching class members:", err);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        api.get("/students?limit=1000"),
        api.get("/teachers?limit=1000"),
      ]);
      setAllStudents(studentsRes.data.data || []);
      setAllTeachers(teachersRes.data.data || []);
    } catch (err) {
      console.error("Error fetching available members:", err);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.put(`/classes/${classData.id}`, { class_name: className, description });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);

    try {
      await api.post("/classes/students/add", {
        class_id: classData.id,
        student_id: parseInt(selectedStudent),
      });
      setSelectedStudent("");
      fetchClassMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Remove this student from the class?")) return;
    setLoading(true);
    setError(null);

    try {
      await api.post("/classes/students/remove", {
        class_id: classData.id,
        student_id: studentId,
      });
      fetchClassMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove student");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    setError(null);

    try {
      await api.post("/classes/teachers/add", {
        class_id: classData.id,
        teacher_id: parseInt(selectedTeacher),
      });
      setSelectedTeacher("");
      alert("Teacher added successfully!");
      fetchAvailableMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Manage Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <MdClose size={20} />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "details"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Class Details
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "students"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Students ({classStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "teachers"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Teachers ({classDetails?.teacher_count || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Details Tab */}
          {activeTab === "details" && (
            <form onSubmit={handleUpdateClass} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Select a student to add...</option>
                  {allStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name || `Student #${student.id}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddStudent}
                  disabled={!selectedStudent || loading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  <MdAdd size={16} /> Add
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl overflow-hidden">
                {classStudents.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No students assigned yet</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {classStudents.map((student) => (
                      <li key={student.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === "teachers" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Select a teacher to add...</option>
                  {allTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || `Teacher #${teacher.id}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddTeacher}
                  disabled={!selectedTeacher || loading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  <MdAdd size={16} /> Add
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                {!classDetails?.teacher_names ? (
                  <p className="text-center py-6 text-gray-400 text-sm">No teachers assigned yet</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-2">Assigned Teachers:</p>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">{classDetails.teacher_names}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">Select a teacher from the dropdown and click Add to assign them to this class.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;
