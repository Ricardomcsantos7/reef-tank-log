import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AquariumPage() {
  const { id } = useParams();
  const [aquarium, setAquarium] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [logType, setLogType] = useState("water_test");
  const [logData, setLogData] = useState("");

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

    let parsedData = null;
    if (logData) {
      try {
        parsedData = JSON.parse(logData);
      } catch {
        return alert("Invalid JSON format");
      }
    }

    const { data, error } = await supabase.from("logs").insert([
      {
        aquarium_id: id,
        type: logType,
        data: parsedData,
      },
    ]);

    if (error) alert(error.message);
    else {
      setLogData("");
      fetchLogs();
    }
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

        <textarea
          placeholder='Log data as JSON, e.g. {"pH":8.1,"temp":25}'
          value={logData}
          onChange={(e) => setLogData(e.target.value)}
          className="block w-full p-2 border rounded bg-gray-800 text-white placeholder-gray-400"
        />

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
            <pre className="text-sm">{JSON.stringify(log.data, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
