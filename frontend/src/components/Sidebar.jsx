import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdDashboard, MdMeetingRoom, MdPeople, MdMenuBook, MdLogout } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import timedoorLogo from "../assets/timedoor_logo.png";

// Role-based navigation items
const getNavItems = (role) => {
  const baseItems = [
    { label: "Dashboard", path: "/dashboard", icon: <MdDashboard size={18} /> },
  ];

  const roleItems = {
    admin: [
      { label: "Students", path: "/students", icon: <PiStudentFill size={18} /> },
      { label: "Teachers", path: "/teachers", icon: <MdPeople size={18} /> },
      { label: "Meetings", path: "/meetings", icon: <MdMeetingRoom size={18} /> },
      { label: "Courses", path: "/courses", icon: <MdMenuBook size={18} /> },
      { label: "Classes", path: "/classes", icon: <MdMenuBook size={18} /> },
    ],
    teacher: [
      { label: "Meetings", path: "/meetings", icon: <MdMeetingRoom size={18} /> },
      { label: "Courses", path: "/courses", icon: <MdMenuBook size={18} /> },
    ],
    student: [],
    parent: [],
  };

  return [...baseItems, ...(roleItems[role] || [])];
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role || "student");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 flex flex-col justify-between py-6 px-4">
      {/* Logo Section */}
      <div>
        <div className="flex items-left justify-left  mb-5">
          <img src={timedoorLogo} alt="Timedoor" className="h-8" />
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-green-500 text-white shadow-md shadow-green-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-3">
        <div className="px-4 py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm">
          <p className="text-sm font-bold text-gray-800 mb-1">{user?.name}</p>
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
        >
          <MdLogout size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;