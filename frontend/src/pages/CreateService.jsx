import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
function CreateService() {
  const [name, setName] = useState("");
  const [baseurl, setBaseurl] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  async function createRequestSent(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post("/services", {
        name,
        baseurl,
      });
      toast.success("Service Created");
      navigate("/services");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create service");
    } finally {
      setCreating(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          APIShield
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Register a New Service 🚀
        </p>

        <form onSubmit={createRequestSent} className="space-y-5">
          <div>
            <label className="block font-medium mb-2">Service Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Base URL</label>

            <input
              type="text"
              value={baseurl}
              onChange={(e) => setBaseurl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            disabled={creating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
          >
            {creating ? "Creating..." : "Create Service"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateService;
