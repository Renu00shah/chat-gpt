import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { prevPrompts, newChat } = useContext(Context);

  return (
    <div
      className={`flex flex-col bg-[#f0f4f9] p-4 h-screen transition-all duration-300 ${
        collapsed ? "w-[60px]" : "w-[250px]"
      }`}
    >
      {/* Menu Icon - Toggle Collapse */}
      <div className="flex justify-between items-center">
        <img
          width={20}
          src={assets.menu_icon}
          alt="menu"
          className="cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* New Chat Button */}
      <div
        onClick={() => newChat()}
        className="flex items-center gap-3 bg-[#e6eaf1] rounded-full text-sm cursor-pointer text-gray-500 p-2 mt-4"
      >
        <img width={20} src={assets.plus_icon} alt="plus" />
        {!collapsed && <p>New Chat</p>}
      </div>

      {/* Recent Chats */}
      <div className="mt-6">
        {!collapsed && <p className="font-semibold">Recent</p>}
        {prevPrompts.map((item, index) => (
          <div
            key={index}
            className="flex items-center mt-2 gap-2 p-2 bg-gray-100 rounded-md hover:bg-[#e6eaf1] cursor-pointer"
          >
            <img width={20} src={assets.message_icon} alt="message" />
            {!collapsed && <p>{item.slice(0, 18)}...</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
