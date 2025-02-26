import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

export default function Sidebar() {
  const [extended, setExtended] = useState(false);
  const { onSent, prevPrompts, setRecentPrompt } = useContext(Context);
  // const loadPrompt = async (prompt) => {
  //   console.log("Loading Prompt:", prompt);
  //   setRecentPrompt(prompt);
  //   await onSent(prompt);
  // };
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
          {prevPrompts.map((item, index) => {
            return (
              <div
                key={index}
                // onClick={() => loadPrompt(item)}
                className="flex items-center mt-2 gap-2 p-2 bg-gray-100 rounded-md hover:bg-[#e6eaf1] cursor-pointer"
              >
                <img width={20} src={assets.message_icon} alt="message" />
                <p>{item.slice(0, 18)}...</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
