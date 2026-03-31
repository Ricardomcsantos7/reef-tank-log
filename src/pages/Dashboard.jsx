import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getColorClass } from "../components/utils/ColorUtils";

export default function Dashboard() {
  const [aquariums, setAquariums] = useState([]);
  const [latestParams, setLatestParams] = useState({});
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

  // Fetch latest log per aquarium whenever parameters change ---
  function getLatestParameters(logs) {
    const latest = {
      temperature: null,
      salinity: null,
      alkalinity: null,
      calcium: null,
      magnesium: null,
      nitrate: null,
      phosphate: null,
    };

    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];

      if (latest.temperature === null && log.temperature != null)
        latest.temperature = log.temperature;

      if (latest.salinity === null && log.salinity != null)
        latest.salinity = log.salinity;

      if (latest.alkalinity === null && log.alkalinity != null)
        latest.alkalinity = log.alkalinity;

      if (latest.calcium === null && log.calcium != null)
        latest.calcium = log.calcium;

      if (latest.magnesium === null && log.magnesium != null)
        latest.magnesium = log.magnesium;

      if (latest.nitrate === null && log.nitrate != null)
        latest.nitrate = log.nitrate;

      if (latest.phosphate === null && log.phosphate != null)
        latest.phosphate = log.phosphate;
    }

    return latest;
  }

  /* UseEffect */
  useEffect(() => {
    if (aquariums.length === 0) return;

    const fetchParams = async () => {
      const paramsObj = {};

      for (let tank of aquariums) {
        const { data: logs } = await supabase
          .from("logs")
          .select("*")
          .eq("aquarium_id", tank.id)
          .order("created_at", { ascending: true }); // important

        paramsObj[tank.id] = logs ? getLatestParameters(logs) : null;
      }

      setLatestParams(paramsObj);
    };

    fetchParams();
  }, [aquariums]);

  /* handleAddAquarium */
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
          const params = latestParams[tank.id];
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

              {params ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-4">
                  {params?.temperature !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "temperature",
                        params.temperature,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.temperature}
                        <span className="text-xl">°C</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Temperature
                      </span>
                    </div>
                  )}
                  {params?.salinity !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "salinity",
                        params.salinity,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.salinity}
                        <span className="text-xl">SG</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Salinity
                      </span>
                    </div>
                  )}
                  {params?.alkalinity !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "alkalinity",
                        params.alkalinity,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.alkalinity}
                        <span className="text-xl">dKH</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Alkalinity
                      </span>
                    </div>
                  )}
                  {params?.calcium !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "calcium",
                        params.calcium,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.calcium}
                        <span className="text-xl">ppm</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Calcium
                      </span>
                    </div>
                  )}
                  {params?.magnesium !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "magnesium",
                        params.magnesium,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.magnesium}
                        <span className="text-xl">ppm</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Magnesium
                      </span>
                    </div>
                  )}
                  {params?.nitrate !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "nitrate",
                        params.nitrate,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.nitrate}
                        <span className="text-xl">ppm</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Nitrate
                      </span>
                    </div>
                  )}
                  {params?.phosphate !== null && (
                    <div
                      className={`flex flex-col justify-between items-center rounded w-full aspect-square p-2 ${getColorClass(
                        "phosphate",
                        params.phosphate,
                      )} bg-slate-900`}
                    >
                      <span></span>
                      <span className="text-4xl sm:text-4xl font-bold">
                        {params.phosphate}
                        <span className="text-xl">ppm</span>
                      </span>
                      <span className="text-sm mt-1 text-slate-300">
                        Phosphate
                      </span>
                    </div>
                  )}
                </div>
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
