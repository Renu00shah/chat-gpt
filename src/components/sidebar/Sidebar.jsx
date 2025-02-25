import React, { useState } from "react";
import { assets } from "../../assets/assets";

export default function Sidebar() {
  const [extended, setExtended] = useState(false);
  return (
    <div className=" flex flex-col  justify-between bg-[#f0f4f9] p-4">
      {/* Top Section */}
      <div className="">
        <img width={20} src={assets.menu_icon} alt="menu" />
        <div className=" flex items-center gap-3 bg-[#e6eaf1] rounded-full text-sm cursor-pointer text-gray-500 p-2 mt-2">
          <img width={20} src={assets.plus_icon} alt="plus" />
          <p>New Chat</p>
        </div>
        <div className="mt-4">
          <p className="font-semibold">Recent</p>
          <div className="flex items-center mt-2 gap-2 p-2 bg-gray-100 rounded-md hover:bg-[#e6eaf1] cursor-pointer">
            <img width={20} src={assets.message_icon} alt="message" />
            <p>What is react...</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="">
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md  hover:bg-[#e6eaf1]">
          <img width={20} src={assets.question_icon} alt="question" />
          <p>Help</p>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-[#e6eaf1]">
          <img width={20} src={assets.history_icon} alt="history" />
          <p>Activity</p>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-[#e6eaf1]">
          <img width={20} src={assets.setting_icon} alt="settings" />
          <p>Settings</p>
        </div>
      </div>
    </div>
  );
}
