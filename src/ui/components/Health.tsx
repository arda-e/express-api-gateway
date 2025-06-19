import React, { useEffect, useState } from "react";

interface HealthState {
  database: string;
  redis: string;
}

const Health = () => {
  const [health, setHealth] = useState<HealthState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/v1/admin/health", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to fetch health");
        }
        const data = await res.json();
        setHealth(data.data);
      } catch (err) {
        setError("Failed to load health status");
      }
    };
    fetchHealth();
  }, []);

  if (error) {
    return <div className="health">{error}</div>;
  }
  if (!health) {
    return <div className="health">Loading health...</div>;
  }
  return (
    <div className="health">
      <h2>System Health</h2>
      <ul>
        <li>Database: {health.database}</li>
        <li>Redis: {health.redis}</li>
      </ul>
    </div>
  );
};

export default Health;
