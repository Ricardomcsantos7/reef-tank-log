import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 px-4">
      <h1 className="text-4xl font-semibold mb-2 tracking-tight">
        ReefTank Log 🐠
      </h1>

      <p className="text-slate-400 mb-8 text-center">
        Simple tracking for your reef aquarium
      </p>

      <div className="flex gap-4">
        <Button to="/login">Login</Button>
        <Button to="/register" variant="secondary">
          Register
        </Button>
      </div>
    </div>
  );
}
