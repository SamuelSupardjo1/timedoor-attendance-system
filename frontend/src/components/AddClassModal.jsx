import { useState, useEffect } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import api from "../api/axios";

const AddClassModal = ({ onClose, onSuccess }) => {
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]); // Array of teacher objects
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of student objects
  
  const [currentTeacherId, setCurrentTeacherId] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersRes = await api.get("/teachers?limit=1000");
        setAllTeachers(teachersRes.data.data.data || []);
        
        const studentsRes = await api.get("/students?limit=1000");
        setAllStudents(studentsRes.data.data.data || []);
      } catch (err) {
        console.error("Error fetching teachers or students:", err);
      }
    };
    fetchData();
  }, []);

  const handleAddTeacher = () => {
    if (!currentTeacherId) return;
    const teacher = allTeachers.find((t) => t.id === parseInt(currentTeacherId));
    if (teacher && !selectedTeachers.some((t) => t.id === teacher.id)) {
      setSelectedTeachers((prev) => [...prev, teacher]);
    }
    setCurrentTeacherId("");
  };

  const handleRemoveTeacher = (teacherId) => {
    setSelectedTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  const handleAddStudent = () => {
    if (!currentStudentId) return;
    const student = allStudents.find((s) => s.id === parseInt(currentStudentId));
    if (student && !selectedStudents.some((s) => s.id === student.id)) {
      setSelectedStudents((prev) => [...prev, student]);
    }
    setCurrentStudentId("");
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/classes", {
        class_name: className,
        description,
        teacher_ids: selectedTeachers.map((t) => t.id),
        student_ids: selectedStudents.map((s) => s.id),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Create New Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <MdClose size={20} />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 flex-shrink-0">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Class Name *</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              placeholder="e.g. Class 10-A"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Class description..."
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>

          {/* Assign Teachers */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Assign Teachers</label>
            <div className="flex gap-2 mb-2 ">
              <div className="relative flex-1">
                <select
                  value={currentTeacherId}
                  onChange={(e) => setCurrentTeacherId(e.target.value)}
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
                type="button"
                onClick={handleAddTeacher}
                disabled={!currentTeacherId}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                <MdAdd size={16} /> Add
              </button>
            </div>

            {selectedTeachers.length > 0 && (
              <div className="bg-gray-50 rounded-xl overflow-hidden max-h-32 overflow-y-auto border border-gray-150">
                <ul className="divide-y divide-gray-200">
                  {selectedTeachers.map((teacher) => (
                    <li key={teacher.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition">
                      <div>
                        <p className="text-xs font-medium text-gray-800">{teacher.name}</p>
                        <p className="text-[10px] text-gray-500">{teacher.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeacher(teacher.id)}
                        className="px-2 py-1 text-[10px] text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Assign Students */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Assign Students</label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <select
                  value={currentStudentId}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
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
                type="button"
                onClick={handleAddStudent}
                disabled={!currentStudentId}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                <MdAdd size={16} /> Add
              </button>
            </div>

            {selectedStudents.length > 0 && (
              <div className="bg-gray-50 rounded-xl overflow-hidden max-h-32 overflow-y-auto border border-gray-150">
                <ul className="divide-y divide-gray-200">
                  {selectedStudents.map((student) => (
                    <li key={student.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition">
                      <div>
                        <p className="text-xs font-medium text-gray-800">{student.name}</p>
                        <p className="text-[10px] text-gray-500">{student.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(student.id)}
                        className="px-2 py-1 text-[10px] text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4 flex-shrink-0">
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
              {loading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
