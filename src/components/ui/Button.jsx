import { Link } from "react-router-dom";

export default function Button({
  children,
  to,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const base =
    "px-5 py-2 rounded-md transition font-medium inline-block text-center";

  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    secondary:
      "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-700",
  };

  const styles = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles}>
      {children}
    </button>
  );
}
