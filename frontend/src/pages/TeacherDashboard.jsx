import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-purple-500">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Manage your classes and student attendance</p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-purple-50 rounded-2xl p-12 shadow-sm border border-purple-200 text-center">
        <p className="text-4xl mb-3">👨‍🏫</p>
        <p className="text-purple-600 font-medium text-lg">Teacher Dashboard Coming Soon</p>
        <p className="text-purple-500 text-sm mt-2">Features for managing classes, approving attendance, and providing feedback will be available here</p>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
