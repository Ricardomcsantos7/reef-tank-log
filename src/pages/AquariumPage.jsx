import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AquariumPage() {
  const { id } = useParams();
  const aquariumId = Number(id);
  const [aquarium, setAquarium] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [logType, setLogType] = useState("water_test");

  // Water test fields
  const [temperature, setTemperature] = useState("");
  const [ph, setPh] = useState("");
  const [salinity, setSalinity] = useState("");

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
    console.log("Adding log...");
    console.log("aquariumId:", aquariumId);

    let data = {};

    if (logType === "water_test") {
      data = {
        temperature: temperature ? Number(temperature) : null,
        ph: ph ? Number(ph) : null,
        salinity: salinity ? Number(salinity) : null,
      };
    }

    if (logType === "water_change") {
      data = {
        amount: changeAmount ? Number(changeAmount) : null,
      };
    }

    if (logType === "media") {
      data = {
        type: mediaType,
        action: mediaAction,
      };
    }

    const { error } = await supabase.from("logs").insert([
      {
        aquarium_id: aquariumId,
        type: logType,
        data,
      },
    ]);

    if (error) return alert(error.message);

    // Reset fields
    setTemperature("");
    setPh("");
    setSalinity("");
    setChangeAmount("");
    setMediaType("");
    setMediaAction("added");

    fetchLogs();
  };

  if (loading) return <div>Loading...</div>;
  if (!aquarium) return <div>Aquarium not found</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">{aquarium.name}</h1>
      {aquarium.volume && <p className="mb-4">Volume: {aquarium.volume} L</p>}

      <form onSubmit={handleAddLog} className="mb-4 space-y-2">
        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          className="block w-full p-2 border rounded bg-gray-800 text-white"
        >
          <option value="water_test">Water Test</option>
          <option value="water_change">Water Change</option>
          <option value="media">Media / Activated Carbon</option>
        </select>

        {/* Dynamic Form Fields */}

        {logType === "water_test" && (
          <>
            <input
              type="number"
              placeholder="Temperature (°C)"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="block w-full p-2 border rounded bg-gray-800 text-white"
            />
            <input
              type="number"
              placeholder="pH"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="block w-full p-2 border rounded bg-gray-800 text-white"
            />
            <input
              type="number"
              placeholder="Salinity"
              value={salinity}
              onChange={(e) => setSalinity(e.target.value)}
              className="block w-full p-2 border rounded bg-gray-800 text-white"
            />
          </>
        )}

        {logType === "water_change" && (
          <input
            type="number"
            placeholder="Water changed (liters)"
            value={changeAmount}
            onChange={(e) => setChangeAmount(e.target.value)}
            className="block w-full p-2 border rounded bg-gray-800 text-white"
          />
        )}

        {logType === "media" && (
          <>
            <input
              type="text"
              placeholder="Media type (e.g. Carbon)"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="block w-full p-2 border rounded bg-gray-800 text-white"
            />
            <select
              value={mediaAction}
              onChange={(e) => setMediaAction(e.target.value)}
              className="block w-full p-2 border rounded bg-gray-800 text-white"
            >
              <option value="added">Added</option>
              <option value="removed">Removed</option>
            </select>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Log
        </button>
      </form>

      <h2 className="text-xl font-bold mb-2">Logs</h2>
      {logs.length === 0 && <p>No logs yet.</p>}
      <ul>
        {logs.map((log) => (
          <li
            key={log.id}
            className="border p-2 mb-2 rounded bg-gray-800 text-white"
          >
            <strong>{log.type}</strong> -{" "}
            {new Date(log.created_at).toLocaleString()}
            {log.type === "water_test" && (
              <div>
                Temp: {log.data?.temperature ?? "-"} °C | pH:{" "}
                {log.data?.ph ?? "-"} | Salinity: {log.data?.salinity ?? "-"}
              </div>
            )}
            {log.type === "water_change" && (
              <div>Water changed: {log.data?.amount ?? "-"} L</div>
            )}
            {log.type === "media" && (
              <div>
                {log.data?.type} {log.data?.action}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
