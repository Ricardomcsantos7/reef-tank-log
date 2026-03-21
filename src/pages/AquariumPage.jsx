import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function AquariumPage() {
  const { id } = useParams();
  const aquariumId = Number(id);
  const [aquarium, setAquarium] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [logType, setLogType] = useState("water_test");

  // Water test fields
  const [temperature, setTemperature] = useState("");
  const [salinity, setSalinity] = useState("");
  const [alkalinity, setAlkalinity] = useState("");
  const [calcium, setCalcium] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [nitrate, setNitrate] = useState("");
  const [phosphate, setPhosphate] = useState("");

  // Water change
  const [changeAmount, setChangeAmount] = useState("");

  // Media
  const [mediaType, setMediaType] = useState("");
  const [mediaAction, setMediaAction] = useState("added");

  useEffect(() => {
    fetchAquarium();
    fetchLogs();
  }, [id]);

  const fetchAquarium = async () => {
    const { data, error } = await supabase
      .from("aquariums")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.log(error);
    else setAquarium(data);
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("aquarium_id", id)
      .order("created_at", { ascending: false });
    if (error) console.log(error);
    else setLogs(data);
    setLoading(false);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();

    try {
      let insertData = { aquarium_id: aquariumId, type: logType };

      if (logType === "water_test") {
        insertData = {
          ...insertData,
          temperature: temperature ? Number(temperature) : null,
          salinity: salinity ? Number(salinity) : null,
          alkalinity: alkalinity ? Number(alkalinity) : null,
          calcium: calcium ? Number(calcium) : null,
          magnesium: magnesium ? Number(magnesium) : null,
          nitrate: nitrate ? Number(nitrate) : null,
          phosphate: phosphate ? Number(phosphate) : null,
        };
      }

      if (logType === "water_change") {
        insertData = {
          ...insertData,
          amount: changeAmount ? Number(changeAmount) : null,
        };
      }

      if (logType === "media") {
        insertData = {
          ...insertData,
          media_type: mediaType || null,
          media_action: mediaAction || null,
        };
      }

      const { error } = await supabase.from("logs").insert([insertData]);
      if (error) throw error;

      // Reset fields
      setTemperature("");
      setSalinity("");
      setAlkalinity("");
      setCalcium("");
      setMagnesium("");
      setNitrate("");
      setPhosphate("");
      setChangeAmount("");
      setMediaType("");
      setMediaAction("added");

      fetchLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!aquarium) return <div>Aquarium not found</div>;

  const getColorClass = (param, value) => {
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
        if (value < 1 || value > 20) return "text-red-500";
        if (value < 2 || value > 10) return "text-yellow-400"; // optional finer warning
        return "text-green-400";

      case "phosphate":
        if (value < 0.01 || value > 0.2) return "text-red-500";
        if (value < 0.02 || value > 0.1) return "text-yellow-400"; // optional finer warning
        return "text-green-400";

      default:
        return "text-slate-100";
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">{aquarium.name}</h1>
      {aquarium.volume && <p className="mb-4">Volume: {aquarium.volume} L</p>}

      <Card className="mb-6 w-full max-w-md mx-auto p-4">
        <h2 className="text-lg font-medium mb-4 text-center">Add Log</h2>

        <form onSubmit={handleAddLog} className="space-y-3">
          {/* Log Type */}
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            className="block w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
          >
            <option value="water_test">Water Test</option>
            <option value="water_change">Water Change</option>
            <option value="media">Media / Activated Carbon</option>
          </select>

          {/* Water Test Fields */}
          {logType === "water_test" && (
            <>
              <input
                type="number"
                placeholder="Temperature (°C)"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />

              <input
                type="number"
                placeholder="Salinity (SG)"
                step="0.001"
                value={salinity}
                onChange={(e) => setSalinity(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Alkalinity (dKH)"
                value={alkalinity}
                onChange={(e) => setAlkalinity(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Calcium (ppm)"
                value={calcium}
                onChange={(e) => setCalcium(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Magnesium (ppm)"
                value={magnesium}
                onChange={(e) => setMagnesium(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Nitrate (ppm)"
                value={nitrate}
                onChange={(e) => setNitrate(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
              <input
                type="number"
                placeholder="Phosphate (ppm)"
                value={phosphate}
                onChange={(e) => setPhosphate(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
            </>
          )}

          {/* Water Change Fields */}
          {logType === "water_change" && (
            <input
              type="number"
              placeholder="Water changed (liters)"
              value={changeAmount}
              onChange={(e) => setChangeAmount(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
            />
          )}

          {/* Media Fields */}
          {logType === "media" && (
            <>
              <input
                type="text"
                placeholder="Media type (e.g. Carbon)"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500"
              />
              <select
                value={mediaAction}
                onChange={(e) => setMediaAction(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
              >
                <option value="added">Added</option>
                <option value="removed">Removed</option>
              </select>
            </>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full">
            Add Log
          </Button>
        </form>
      </Card>

      <h2 className="text-xl font-bold mb-2">Logs</h2>
      {logs.length === 0 && <p>No logs yet.</p>}
      <ul className="space-y-2">
        {logs.map((log) => {
          // Format the date for this log
          const dateStr = new Date(log.created_at).toLocaleDateString("en-GB");
          const timeStr = new Date(log.created_at).toLocaleTimeString("en-GB");

          return (
            <li
              key={log.id}
              className="border rounded-md p-3 bg-slate-800 text-slate-100"
            >
              <div className="flex justify-between mb-1">
                <strong className="capitalize">
                  {log.type.replace("_", " ")}
                </strong>
                <span className="text-sm text-slate-400">
                  {dateStr} {timeStr}
                </span>
              </div>

              {log.type === "water_test" && (
                <div className="text-sm space-y-1">
                  {log.temperature !== null && (
                    <div
                      className={getColorClass("temperature", log.temperature)}
                    >
                      Temp: {log.temperature} °C
                    </div>
                  )}
                  {log.salinity !== null && (
                    <div className={getColorClass("salinity", log.salinity)}>
                      Salinity: {log.salinity} SG
                    </div>
                  )}
                  {log.alkalinity !== null && (
                    <div
                      className={getColorClass("alkalinity", log.alkalinity)}
                    >
                      Alkalinity: {log.alkalinity} dKH
                    </div>
                  )}
                  {log.calcium !== null && (
                    <div className={getColorClass("calcium", log.calcium)}>
                      Calcium: {log.calcium} ppm
                    </div>
                  )}
                  {log.magnesium !== null && (
                    <div className={getColorClass("magnesium", log.magnesium)}>
                      Magnesium: {log.magnesium} ppm
                    </div>
                  )}
                  {log.nitrate !== null && (
                    <div className={getColorClass("nitrate", log.nitrate)}>
                      Nitrate: {log.nitrate} ppm
                    </div>
                  )}
                  {log.phosphate !== null && (
                    <div className={getColorClass("phosphate", log.phosphate)}>
                      Phosphate: {log.phosphate} ppm
                    </div>
                  )}
                </div>
              )}

              {log.type === "water_change" && (
                <div className="text-sm">
                  Water changed: {log.amount ?? "-"} L
                </div>
              )}

              {log.type === "media" && (
                <div className="text-sm">
                  {log.media_type} {log.media_action}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
