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
  const [classTeachers, setClassTeachers] = useState([]);
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
      const [studentsRes, teachersRes] = await Promise.all([
        api.get(`/classes/${classData.id}/students`),
        api.get(`/classes/${classData.id}/teachers`),
      ]);
      setClassStudents(studentsRes.data.data || []);
      setClassTeachers(teachersRes.data.data || []);
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
      setAllStudents(studentsRes.data.data.data || []);
      setAllTeachers(teachersRes.data.data.data || []);
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
      fetchClassMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!confirm("Remove this teacher from the class?")) return;
    setLoading(true);
    setError(null);

    try {
      await api.post("/classes/teachers/remove", {
        class_id: classData.id,
        teacher_id: teacherId,
      });
      fetchClassMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove teacher");
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
            Teachers ({classTeachers.length})
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
                <div className="relative flex-1">
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-green-400 text-slate-700 font-semibold rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-200 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                      backgroundSize: "14px",
                      paddingRight: "36px"
                    }}
                  >
                    <option value="" className="text-slate-400 font-normal">Select a student to add...</option>
                    {allStudents.map((student) => (
                      <option key={student.id} value={student.id} className="text-slate-700">
                        {student.name || `Student #${student.id}`}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div className="relative flex-1">
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-green-400 text-slate-700 font-semibold rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-200 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                      backgroundSize: "14px",
                      paddingRight: "36px"
                    }}
                  >
                    <option value="" className="text-slate-400 font-normal">Select a teacher to add...</option>
                    {allTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id} className="text-slate-700">
                        {teacher.name || `Teacher #${teacher.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddTeacher}
                  disabled={!selectedTeacher || loading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  <MdAdd size={16} /> Add
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl overflow-hidden">
                {classTeachers.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No teachers assigned yet</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {classTeachers.map((teacher) => (
                      <li key={teacher.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
                          <p className="text-xs text-gray-500">{teacher.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveTeacher(teacher.id)}
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
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;
