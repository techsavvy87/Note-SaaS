import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import "./index.css";

import AcceptInvitation from "./pages/AcceptInvitation";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Members from "./pages/Members";
import Notes from "./pages/Notes";
import Pricing from "./pages/Pricing";
import Register from "./pages/Register";
import Workspaces from "./pages/Workspaces";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <nav className="topbar">
        <Link to="/dashboard" className="brand"><span className="brand-mark">N</span><span>Notely</span></Link>
        <div className="nav-links">
          <NavLink className={({isActive}) => `nav-link ${isActive ? "active" : ""}`} to="/dashboard">Dashboard</NavLink>
          <NavLink className={({isActive}) => `nav-link ${isActive ? "active" : ""}`} to="/workspaces">Workspaces</NavLink>
          <NavLink className={({isActive}) => `nav-link ${isActive ? "active" : ""}`} to="/pricing">Pricing</NavLink>
          <NavLink className={({isActive}) => `nav-link auth ${isActive ? "active" : ""}`} to="/login">Sign in</NavLink>
          <NavLink className={({isActive}) => `nav-link auth ${isActive ? "active" : ""}`} to="/register">Get started</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/workspaces"
          element={<Workspaces />}
        />

        <Route
          path="/workspaces/:workspaceId/notes"
          element={<Notes />}
        />

        <Route
          path="/workspaces/:workspaceId/members"
          element={<Members />}
        />

        <Route
          path="/invitations/:token"
          element={<AcceptInvitation />}
        />

        <Route
          path="/pricing"
          element={<Pricing />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
