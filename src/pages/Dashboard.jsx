// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [aquariums, setAquariums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");

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
      fetchAquariums();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Your Aquariums</h1>

      {/* Add Aquarium Form */}
      <form onSubmit={handleAddAquarium} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Aquarium Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full p-2 border rounded bg-gray-800 text-white placeholder-gray-400"
          required
        />
        <input
          type="number"
          placeholder="Volume (liters)"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="block w-full p-2 border rounded bg-gray-800 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Aquarium
        </button>
      </form>

      {/* Aquarium List */}
      {aquariums.length === 0 && <p>No aquariums yet.</p>}
      <ul>
        {aquariums.map((tank) => (
          <li key={tank.id} className="border p-2 mb-2 rounded bg-gray-800">
            {tank.id ? (
              <Link
                to={`/aquarium/${tank.id}`}
                className="text-blue-400 hover:underline"
              >
                {tank.name} ({tank.volume || "?"} L)
              </Link>
            ) : (
              <span>{tank.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
