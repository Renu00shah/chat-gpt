import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Main from "./components/main/Main";

export default function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed & Responsive */}
      <div className="h-full w-[250px] bg-gray-200 fixed left-0 top-0">
        <Sidebar />
      </div>

      {/* Main - Scrollable Content */}
      <div className="flex-1 h-full overflow-y-auto ml-[250px] p-4">
        <Main />
      </div>
    </div>
  );
}
