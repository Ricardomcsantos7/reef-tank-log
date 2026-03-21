// ColorUtils.jsx
export const getColorClass = (param, value) => {
  if (value === null || value === undefined) return "text-slate-400";

  switch (param) {
    case "temperature":
      if (value < 23 || value > 28) return "text-red-500";
      if (value < 24 || value > 26) return "text-yellow-400";
      return "text-green-400";
    case "salinity":
      if (value < 1.023 || value > 1.027) return "text-red-500";
      if (value < 1.025 || value > 1.026) return "text-yellow-400";
      return "text-green-400";
    case "alkalinity":
      if (value < 6.5 || value > 13) return "text-red-500";
      if (value < 7 || value > 12) return "text-yellow-400";
      return "text-green-400";
    case "calcium":
      if (value < 390 || value > 460) return "text-red-500";
      if (value < 400 || value > 450) return "text-yellow-400";
      return "text-green-400";
    case "magnesium":
      if (value < 1200 || value > 1400) return "text-red-500";
      if (value < 1250 || value > 1350) return "text-yellow-400";
      return "text-green-400";
    case "nitrate":
      if (value < 1 || value > 10) return "text-red-500";
      if (value < 2 || value > 10) return "text-yellow-400";
      return "text-green-400";
    case "phosphate":
      if (value < 0.01 || value > 0.1) return "text-red-500";
      if (value < 0.02 || value > 0.1) return "text-yellow-400";
      return "text-green-400";
    default:
      return "text-slate-100";
  }
};
