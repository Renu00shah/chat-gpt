import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Main from "./components/main/Main";

export default function App() {
  return (
    <>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar - Fixed Height */}
        <div className="h-full w-[250px] bg-gray-200">
          <Sidebar />
        </div>

        {/* Main - Full Width, Scrollable */}
        <div className="flex-1 h-full overflow-y-auto">
          <Main />
        </div>
      </div>
    </>
  );
}
