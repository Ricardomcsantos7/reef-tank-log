import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">ReefTank Log 🐠</h1>
      <p className="mb-6">Track your reef aquarium like a pro</p>

      <div className="space-x-4">
        <Link
          to="/login"
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
