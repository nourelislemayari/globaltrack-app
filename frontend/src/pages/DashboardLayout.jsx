import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pb-12">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

