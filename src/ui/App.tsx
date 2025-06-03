import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./components/Login";

interface QueueItem {
  id: string;
  data: any;
  status: string;
}

const QueueDashboard = () => {
  // State for a message shown in the UI and for the queue items.
  const [msg, setMsg] = useState("Waiting for WebSocket...");
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const { logout } = useAuth();

  // Function to fetch active queue items from /api/v1/queue/items
  const fetchQueueItems = async () => {
    console.log("Fetching queue items...");
    try {
      // Include credentials if necessary:
      const response = await fetch("/api/v1/queue/items", { credentials: "include" });
      if (!response.ok) {
        console.error("Failed to fetch items, status:", response.status);
        setQueueItems([]);
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Error: Fetched data is not an array", data);
        setQueueItems([]);
        return;
      }
      setQueueItems(data);
    } catch (err) {
      console.error("Error fetching queue items:", err);
      setQueueItems([]);
    }
  };

  useEffect(() => {
    console.log("📡 Connecting to WebSocket...");
    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error", error);
    };

    ws.onclose = () => {
      console.warn("🔌 WebSocket connection closed");
    };

    ws.onmessage = async (event) => {
      console.log("📨 Received message:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === "refresh") {
          console.log("Triggering fetch due to refresh message...");
          await fetchQueueItems();
          setMsg("Fetching active jobs...");
        } else if (data && data.message) {
          setMsg(data.message);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    // Optionally, trigger an initial fetch
    fetchQueueItems();

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="header-left">
            <h1>Queue Dashboard</h1>
            <p>{msg}</p>
          </div>
          <div className="header-right">
            <button className="primary" onClick={() => fetchQueueItems()}>
              Refetch Jobs
            </button>
            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <div className="content">
          <h2>Active Queue Items</h2>
          <ul>
            {Array.isArray(queueItems) && queueItems.length > 0 ? (
              queueItems.map((item) => (
                <li key={item.id}>
                  <div>ID: {item.id}</div>
                  <div>Status: {item.status}</div>
                  <div>Data: {JSON.stringify(item.data)}</div>
                </li>
              ))
            ) : (
              <li>No jobs found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      {isAuthenticated ? <QueueDashboard /> : <Login />}
    </AuthProvider>
  );
};

export default App;
