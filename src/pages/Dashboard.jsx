import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [aquariums, setAquariums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAquariums();
  }, []);

  const fetchAquariums = async () => {
    const user = supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("aquariums")
      .select("*")
      .eq("user_id", user.id);

    if (error) console.log(error);
    else setAquariums(data);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Aquariums</h1>
      {aquariums.length === 0 && <p>No aquariums yet.</p>}
      <ul>
        {aquariums.map((tank) => (
          <li key={tank.id} className="border p-2 mb-2 rounded">
            {tank.name} ({tank.volume} L)
          </li>
        ))}
      </ul>
    </div>
  );
}
