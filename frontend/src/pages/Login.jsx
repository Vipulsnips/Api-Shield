import axios from "axios";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function loginRequestSent(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://api-shield-1e4k.onrender.com/api/auth/login",
        {
          email,
          password,
        },
      );
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div>
      <form onSubmit={loginRequestSent}>
        <label htmlFor="email">Email</label>
        <input
          value={email}
          id="email"
          type="email"
          onChange={(val) => {
            setEmail(val.target.value);
          }}
        />
        <label htmlFor="password">password</label>
        <input
          value={password}
          id="password"
          type="password"
          onChange={(val) => {
            setPassword(val.target.value);
          }}
        />
        <button type="submit" >Login</button>
      </form>
    </div>
  );
}
export default Login;
