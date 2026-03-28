import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getColorClass } from "../components/utils/ColorUtils";
import ParameterChart from "../components/charts/ParameterChart";
import WaterChangeChart from "../components/charts/WaterChangeChart";

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

  // Date
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState("");

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
      const payload = {
        aquarium_id: aquariumId,
        type: logType,
      };

      if (useCustomDate && customDate) {
        payload.created_at = new Date(customDate).toISOString();
      }

      if (logType === "water_test") {
        Object.assign(payload, {
          temperature: temperature ? Number(temperature) : null,
          salinity: salinity ? Number(salinity) : null,
          alkalinity: alkalinity ? Number(alkalinity) : null,
          calcium: calcium ? Number(calcium) : null,
          magnesium: magnesium ? Number(magnesium) : null,
          nitrate: nitrate ? Number(nitrate) : null,
          phosphate: phosphate ? Number(phosphate) : null,
        });
      }

      if (logType === "water_change") {
        payload.amount = changeAmount ? Number(changeAmount) : null;
      }

      if (logType === "media") {
        payload.media_type = mediaType || null;
        payload.media_action = mediaAction || null;
      }

      const { error } = await supabase.from("logs").insert([payload]);
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
      setUseCustomDate(false);
      setCustomDate("");

      fetchLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  /* CHARTS DATA */
  const temperatureData = logs
    .filter((log) => log.type === "water_test" && log.temperature !== null)
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      temperature: log.temperature,
    }))
    .reverse();

  const alkalinityData = logs
    .filter((log) => log.type === "water_test" && log.alkalinity !== null)
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      alkalinity: log.alkalinity,
    }))
    .reverse();

  const nitrateData = logs
    .filter((log) => log.type === "water_test" && log.nitrate !== null)
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      nitrate: log.nitrate,
    }))
    .reverse();

  const phosphateData = logs
    .filter((log) => log.type === "water_test" && log.phosphate !== null)
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      phosphate: log.phosphate,
    }))
    .reverse();

  /* WATER CHANGES INFO */
  const waterChangeLogs = logs
    .filter((log) => log.type === "water_change" && log.amount !== null)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const last4Changes = waterChangeLogs
    .slice(0, 4)
    .map((log) => {
      const percent = aquarium.volume
        ? (log.amount / aquarium.volume) * 100
        : null;

      return {
        date: new Date(log.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        }),
        percent: percent ? Number(percent.toFixed(1)) : null,
      };
    })
    .reverse();

  const avgLast4 =
    last4Changes.length > 0
      ? (
          last4Changes.reduce((sum, c) => sum + (c.percent || 0), 0) /
          last4Changes.length
        ).toFixed(1)
      : null;

  const now = new Date();
  const last30Days = waterChangeLogs.filter(
    (log) =>
      new Date(log.created_at) > new Date(now - 30 * 24 * 60 * 60 * 1000),
  );

  const avg30 =
    last30Days.length > 0
      ? (
          last30Days.reduce((sum, log) => {
            const percent = aquarium.volume
              ? (log.amount / aquarium.volume) * 100
              : 0;
            return sum + percent;
          }, 0) / last30Days.length
        ).toFixed(1)
      : null;

  let avgDaysBetween = null;

  if (waterChangeLogs.length >= 2) {
    const intervals = [];

    for (let i = 0; i < waterChangeLogs.length - 1; i++) {
      const d1 = new Date(waterChangeLogs[i].created_at);
      const d2 = new Date(waterChangeLogs[i + 1].created_at);

      const diffDays = (d1 - d2) / (1000 * 60 * 60 * 24);
      intervals.push(diffDays);
    }

    avgDaysBetween = (
      intervals.reduce((a, b) => a + b, 0) / intervals.length
    ).toFixed(1);
  }

  if (loading) {
    return (
      <div className="bg-slate-900 flex justify-center pt-24">
        <div className="text-2xl text-slate-100 animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!aquarium) return <div>Aquarium not found</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto w-full space-y-6">
      <h1 className="text-xl font-bold mb-2">{aquarium.name}</h1>
      {aquarium.volume && <p className="mb-4">Volume: {aquarium.volume} L</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEFT: ADD LOG */}
        <Card className="mb-6 w-full p-4">
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
              <option value="media">Media Change</option>
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
                  placeholder="Media type (e.g. Activated Carbon)"
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

            {/* Date */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
              />
              <label className="text-sm text-slate-300">Set custom date</label>
            </div>

            {useCustomDate && (
              <input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100"
              />
            )}

            {/* Submit */}
            <Button type="submit" className="w-full">
              Add Log
            </Button>
          </form>
        </Card>

        {/* RIGHT: Logs */}
        <Card className="mb-6 w-full p-4 max-h-[550px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">Logs</h2>
          {logs.length === 0 && <p>No logs yet.</p>}
          <ul className="space-y-2">
            {logs.map((log) => {
              // Format the date for this log
              const dateStr = new Date(log.created_at).toLocaleDateString(
                "en-GB",
              );
              const timeStr = new Date(log.created_at).toLocaleTimeString(
                "en-GB",
              );

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
                          className={getColorClass(
                            "temperature",
                            log.temperature,
                          )}
                        >
                          Temp: {log.temperature} °C
                        </div>
                      )}
                      {log.salinity !== null && (
                        <div
                          className={getColorClass("salinity", log.salinity)}
                        >
                          Salinity: {log.salinity} SG
                        </div>
                      )}
                      {log.alkalinity !== null && (
                        <div
                          className={getColorClass(
                            "alkalinity",
                            log.alkalinity,
                          )}
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
                        <div
                          className={getColorClass("magnesium", log.magnesium)}
                        >
                          Magnesium: {log.magnesium} ppm
                        </div>
                      )}
                      {log.nitrate !== null && (
                        <div className={getColorClass("nitrate", log.nitrate)}>
                          Nitrate: {log.nitrate} ppm
                        </div>
                      )}
                      {log.phosphate !== null && (
                        <div
                          className={getColorClass("phosphate", log.phosphate)}
                        >
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
        </Card>
      </div>

      {/* CHARTS */}
      <div>
        <h2 className="text-xl font-bold mt-4 mb-2">Charts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ParameterChart
            data={temperatureData}
            dataKey="temperature"
            title="Temperature"
            unit="°C"
            minLimit={23}
            maxLimit={28}
            idealMin={24}
            idealMax={26}
          />

          <ParameterChart
            data={alkalinityData}
            dataKey="alkalinity"
            title="Alkalinity"
            unit="dKH"
            minLimit={6}
            maxLimit={12}
            idealMin={7}
            idealMax={9}
          />

          <ParameterChart
            data={nitrateData}
            dataKey="nitrate"
            title="Nitrate"
            unit="ppm"
            minLimit={1}
            maxLimit={20}
            idealMin={1}
            idealMax={10}
          />

          <ParameterChart
            data={phosphateData}
            dataKey="phosphate"
            title="Phosphate"
            unit="ppm"
            minLimit={0.01}
            maxLimit={0.2}
            idealMin={0.01}
            idealMax={0.1}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WaterChangeChart data={last4Changes} />

        {/* Stats card */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-slate-100">
            Water Change Stats
          </h2>

          <div className="space-y-2 text-sm">
            <div>
              Avg (last 4):{" "}
              <span className="text-blue-400">{avgLast4 ?? "-"}%</span>
            </div>

            <div>
              Avg (30 days):{" "}
              <span className="text-blue-400">{avg30 ?? "-"}%</span>
            </div>

            <div>
              Frequency:{" "}
              <span className="text-blue-400">
                {avgDaysBetween ?? "-"} days
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
