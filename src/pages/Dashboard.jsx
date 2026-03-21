// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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
        <p className="text-slate-400">No aquariums yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {aquariums.map((tank) => (
          <Card key={tank.id}>
            {/* Name */}
            <h2 className="text-lg font-medium mb-3">{tank.name}</h2>

            {/* Volume */}
            <p className="text-sm text-slate-400 mb-4">
              Volume: {tank.volume || "?"} L
            </p>

            {/* Action */}
            {tank.id && <Button to={`/aquarium/${tank.id}`}>View</Button>}
          </Card>
        ))}
      </div>
    </div>
  );
}
