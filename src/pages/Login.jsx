import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    // Supabase user may exist but email not confirmed yet
    const user = data.user;
    if (!user.confirmed_at) {
      alert("You must confirm your email before logging in.");
      return;
    }

    // Proceed to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="bg-slate-900 flex justify-center pt-24 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-center text-slate-100 mb-6">
          Login
        </h1>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition"
          >
            Login
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-400 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-orange-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
