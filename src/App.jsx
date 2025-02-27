import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Main from "./components/main/Main";

export default function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed & Responsive */}
      <div className="h-full  bg-gray-200 ">
        <Sidebar />
      </div>

      {/* Main - Scrollable Content */}
      <div className="flex-1 h-full overflow-y-auto  p-4">
        <Main />
      </div>
    </div>
  );
}
