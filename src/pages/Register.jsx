import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return alert(error.message);

    // Success message
    alert("Registration successful! Check your email to confirm.");

    // Redirect to login instead of dashboard
    navigate("/login");
  };

  return (
    <div className="bg-slate-900 flex justify-center pt-24 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-center text-slate-100 mb-6">
          Create Account
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
            onClick={handleRegister}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition"
          >
            Create Account
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
