import React from "react";

const Navbar = () => {
  return (
    <div className="header">
      <div className="header-left">
        <h1>Admin Dashboard</h1>
      </div>
      <div className="header-right">
        <a href="/admin/dashboard">
          <button className="primary">Dashboard</button>
        </a>
        <a href="/admin/queues">
          <button className="primary">Queues</button>
        </a>
        <a href="/admin/health">
          <button className="primary">Health</button>
        </a>
      </div>
    </div>
  );
};

export default Navbar;
