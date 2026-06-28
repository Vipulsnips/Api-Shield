import API from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  async function createUser(e) {
    e.preventDefault();
    try {
      const response = await API.post("/auth/signup", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  }
return (
  <div className="min-h-screen bg-gray-100 flex justify-center items-center">
    <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

      <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
        APIShield
      </h1>

      <p className="text-center text-gray-500 mb-8">
        Create your account 🚀
      </p>

      <form onSubmit={createUser} className="space-y-5">

        <div>
          <label className="block font-medium mb-2">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Create Account
        </button>

      </form>

      <p className="text-center text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>

    </div>
  </div>
);
}
export default Signup;
