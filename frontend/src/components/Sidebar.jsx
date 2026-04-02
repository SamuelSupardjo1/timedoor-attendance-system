import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdDashboard, MdMeetingRoom, MdChecklist, MdPeople, MdFeedback, MdLogout } from "react-icons/md";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <MdDashboard size={18} /> },
  { label: "Students", path: "/students", icon: <MdPeople size={18} /> },
  { label: "Teachers", path: "/teachers", icon: <MdPeople size={18} /> },
  { label: "Meetings", path: "/meetings", icon: <MdMeetingRoom size={18} /> },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col justify-between py-6 px-4">
      {/* Logo */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TD</span>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">Timedoor</p>
            <p className="text-gray-400 text-xs">Attendance Portal</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-2">
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <MdLogout size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;