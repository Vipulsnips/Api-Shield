import { NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  HomeIcon,
  ServerStackIcon,
  PlusCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
function Navbar() {
  const navigate = useNavigate();

  async function logout() {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2">
        <ServerStackIcon className="h-8 w-8 text-blue-400" />
        <h1 className="text-2xl font-bold text-blue-400">APIShield</h1>
      </div>

      <div className="flex gap-8">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 ${
              isActive
                ? "text-blue-400 font-semibold"
                : "hover:text-blue-400 transition"
            }`
          }
        >
          <HomeIcon className="h-5 w-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/services"
          className={({ isActive }) =>
            `flex items-center gap-2 ${
              isActive
                ? "text-blue-400 font-semibold"
                : "hover:text-blue-400 transition"
            }`
          }
        >
          <ServerStackIcon className="h-5 w-5" />
          Services
        </NavLink>

        <NavLink
          to="/service/create"
          className={({ isActive }) =>
            `flex items-center gap-2 ${
              isActive
                ? "text-blue-400 font-semibold"
                : "hover:text-blue-400 transition"
            }`
          }
        >
          <PlusCircleIcon className="h-5 w-5" />
          Create Service
        </NavLink>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
      >
        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
