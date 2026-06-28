import { useNavigate } from "react-router-dom";
import {
  ServerStackIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to APIShield 
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your APIs, monitor health, and view analytics.
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-10">

          <h2 className="text-2xl font-semibold mb-6">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={() => navigate("/services")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition"
            >
              <ServerStackIcon className="h-5 w-5" />
              My Services
            </button>

            <button
              onClick={() => navigate("/service/create")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg transition"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Create Service
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;