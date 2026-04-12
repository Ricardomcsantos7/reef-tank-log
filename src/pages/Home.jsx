import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import logo from "../assets/dkorallen_logo_white_png.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 px-4">
      <h1 className="text-4xl font-semibold mb-2 tracking-tight">
        <div className="flex items-center gap-2">
          <span>ReefTank</span>
          <span className="text-orange-500">Log </span>
          <img src={logo} alt="Logo" className="h-12 w-12" />
        </div>
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
