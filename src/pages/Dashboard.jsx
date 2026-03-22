import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getColorClass } from "../components/utils/ColorUtils";

export default function Dashboard() {
  const [aquariums, setAquariums] = useState([]);
  const [latestLogs, setLatestLogs] = useState({});
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");

  // Fetch aquariums on mount ---
  useEffect(() => {
    fetchAquariums();
  }, []);

  const fetchAquariums = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("aquariums")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setAquariums(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest log per aquarium whenever aquariums change ---
  useEffect(() => {
    if (aquariums.length === 0) return;

    const fetchLatestLogs = async () => {
      const logsObj = {};
      for (let tank of aquariums) {
        const { data: logData } = await supabase
          .from("logs")
          .select("*")
          .eq("aquarium_id", tank.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        logsObj[tank.id] = logData || null;
      }
      setLatestLogs(logsObj);
    };

    fetchLatestLogs();
  }, [aquariums]);

  const handleAddAquarium = async (e) => {
    e.preventDefault();

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return alert("You must be logged in");

      const { error } = await supabase.from("aquariums").insert([
        {
          user_id: userId,
          name,
          volume: volume ? Number(volume) : null,
        },
      ]);

      if (error) throw error;

      setName("");
      setVolume("");
      fetchAquariums(); // Just refetch aquariums and logs separately
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 flex justify-center pt-24">
        <div className="text-xl text-slate-100 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Aquariums</h1>

      {/* Add Aquarium Form */}
      <div className="flex justify-center mb-6">
        <Card className="w-full max-w-md">
          <h2 className="text-lg font-medium mb-4 text-center">
            Add New Aquarium
          </h2>

          <form onSubmit={handleAddAquarium} className="space-y-3">
            <input
              type="text"
              placeholder="Aquarium Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
              required
            />

            <input
              type="number"
              placeholder="Volume (liters)"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />

            <Button type="submit" className="w-full">
              Add Aquarium
            </Button>
          </form>
        </Card>
      </div>

      {/* Aquarium List */}
      {aquariums.length === 0 && (
        <p className="text-slate-400 text-center mt-4">
          No aquariums yet 🐠 <br />
          <span className="text-sm">Add your first tank above</span>
        </p>
      )}

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {aquariums.map((tank) => {
          const log = latestLogs[tank.id];
          return (
            <Card
              key={tank.id}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <h2 className="text-xl font-bold">{tank.name}</h2>
                {tank.volume && (
                  <p className="text-sm mb-2">Volume: {tank.volume} L</p>
                )}
              </div>

              {log ? (
                log.type === "water_test" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-4">
                    {log.temperature !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "temperature",
                          log.temperature,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.temperature}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Temp
                        </span>
                      </div>
                    )}
                    {log.salinity !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "salinity",
                          log.salinity,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.salinity}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Salinity
                        </span>
                      </div>
                    )}
                    {log.alkalinity !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "alkalinity",
                          log.alkalinity,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.alkalinity}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Alkalinity
                        </span>
                      </div>
                    )}
                    {log.calcium !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "calcium",
                          log.calcium,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.calcium}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Calcium
                        </span>
                      </div>
                    )}
                    {log.magnesium !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "magnesium",
                          log.magnesium,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.magnesium}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Magnesium
                        </span>
                      </div>
                    )}
                    {log.nitrate !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "nitrate",
                          log.nitrate,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.nitrate}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Nitrate
                        </span>
                      </div>
                    )}
                    {log.phosphate !== null && (
                      <div
                        className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                          "phosphate",
                          log.phosphate,
                        )} bg-slate-900`}
                      >
                        <span></span>
                        <span className="text-4xl sm:text-5xl font-bold">
                          {log.phosphate}
                        </span>
                        <span className="text-sm mt-1 text-slate-300">
                          Phosphate
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    Last log: {log.type.replace("_", " ")} -{" "}
                    {new Date(log.created_at).toLocaleDateString("en-GB")}
                  </div>
                )
              ) : (
                <div className="text-sm text-slate-400">No logs yet</div>
              )}
              <div className="flex justify-end mt-4">
                <Link to={`/aquarium/${tank.id}`}>
                  <Button>View</Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
