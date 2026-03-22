import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    // Listen for changes in auth (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white p-4 flex items-center justify-between">
      <Link
        to="/"
        className="font-bold text-lg hover:text-orange-400 transition"
      >
        ReefTank Log 🐠
      </Link>

      <div className="space-x-4">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="text-slate-300 hover:text-white transition"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
