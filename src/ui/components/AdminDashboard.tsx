import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Health from "./Health";

interface QueueItem {
  id: string;
  status: string;
  data: any;
}
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}
interface Role {
  id: string;
  name: string;
  permissions?: Permission[];
}
interface Permission {
  id: string;
  name: string;
}

interface AdminDashboardProps {
  queueItems?: QueueItem[];
  users?: User[];
  roles?: Role[];
  permissions?: Permission[];
}

const AdminDashboard = (props: AdminDashboardProps) => {
  const initial =
    typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ || {} : {};

  const [queueItems, setQueueItems] = useState<QueueItem[]>(
    props.queueItems || initial.queueItems || [],
  );
  const [users, setUsers] = useState<User[]>(props.users || initial.users || []);
  const [roles, setRoles] = useState<Role[]>(props.roles || initial.roles || []);
  const [permissions, setPermissions] = useState<Permission[]>(
    props.permissions || initial.permissions || [],
  );

  const [newRole, setNewRole] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ws = new WebSocket(`ws://${window.location.host}/admin`);
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "queue_update" && data.items) {
          setQueueItems(data.items);
        }
      } catch (err) {
        console.error("ws message error", err);
      }
    };
    return () => ws.close();
  }, []);

  const path =
    typeof window !== "undefined" ? window.location.pathname : "/admin/dashboard";

  const refetchQueue = async () => {
    try {
      const res = await fetch(`/api/v1/queue/items`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setQueueItems(data);
      } else {
        alert("Failed to fetch queue items");
      }
    } catch (err) {
      alert("Failed to fetch queue items");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/admin/roles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRole, permissionIds: selectedPerms }),
      });
      if (res.ok) {
        const role = await res.json();
        setRoles([...roles, role]);
        setNewRole("");
        setSelectedPerms([]);
      } else {
        alert("Failed to create role");
      }
    } catch (err) {
      alert("Failed to create role");
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/roles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRoles(roles.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete role");
      }
    } catch (err) {
      alert("Failed to delete role");
    }
  };

  const renderDashboard = () => (
    <div className="content">
      <h2>Overview</h2>
      <ul>
        <li>Queue Items: {queueItems.length}</li>
        <li>Users: {users.length}</li>
        <li>Roles: {roles.length}</li>
        <li>Permissions: {permissions.length}</li>
      </ul>
    </div>
  );

  const renderQueues = () => (
    <div className="content">
      <h2>Queues</h2>
      <button className="primary" onClick={refetchQueue}>
        Refetch
      </button>
      <ul>
        {queueItems.map((q) => (
          <li key={q.id}>
            <div>ID: {q.id}</div>
            <div>Status: {q.status}</div>
            <div>Data: {JSON.stringify(q.data)}</div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderUsers = () => (
    <div className="content">
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>
                <button className="secondary" onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRoles = () => (
    <div className="content">
      <h2>Roles</h2>
      <ul>
        {roles.map((r) => (
          <li key={r.id}>
            {r.name}
            <button className="secondary" onClick={() => deleteRole(r.id)}>
              Delete
            </button>
            <ul>
              {r.permissions?.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <form onSubmit={createRole}>
        <input
          type="text"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="Role name"
          required
        />
        <select
          multiple
          value={selectedPerms}
          onChange={(e) =>
            setSelectedPerms(
              Array.from(e.target.selectedOptions).map((o) => o.value),
            )
          }
        >
          {permissions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="primary" type="submit">
          Create Role
        </button>
      </form>
    </div>
  );

  let content: React.ReactNode = null;
  if (path.startsWith("/admin/queues")) content = renderQueues();
  else if (path.startsWith("/admin/health")) content = <Health />;
  else if (path.startsWith("/admin/users")) content = renderUsers();
  else if (path.startsWith("/admin/roles")) content = renderRoles();
  else content = renderDashboard();

  return (
    <div className="app">
      <div className="container">
        <Navbar />
        {content}
      </div>
    </div>
  );
};

export default AdminDashboard;
