import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0e0f17] to-[#090a0f]">
        <Outlet />
      </main>
    </div>
  );
};
