import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

export default function AdminLayout() {
  return (
    <div className="dash-container">
      <AdminSidebar />
      <Outlet />
    </div>
  );
}