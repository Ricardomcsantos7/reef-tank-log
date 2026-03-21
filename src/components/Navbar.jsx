import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <Link to="/" className="font-bold text-lg">
        ReefTank Log 🐠
      </Link>

      <div className="space-x-4">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/login" className="hover:underline">
          Login
        </Link>
        <Link to="/register" className="hover:underline">
          Register
        </Link>
        <button onClick={handleLogout} className="text-red-400">
          Logout
        </button>
      </div>
    </nav>
  );
}
