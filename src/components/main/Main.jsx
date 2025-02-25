import React from "react";
import { assets } from "../../assets/assets";

export default function Main() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-[1000px] mt-4">
        <p className="text-gray-600">Gemini</p>
        <img
          className="rounded-full"
          width={40}
          src={assets.user_icon}
          alt="gem"
        />
      </div>

      {/* main */}
      <div className="max-w-[900px] mx-auto">
        <div className="text-[56px] text-[#c4c7c5] font-medium p-[20px]">
          <p>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Hello, Dev
            </span>
          </p>
          <p>How can i help you, today?</p>
        </div>
        {/* cards */}
        <div className="flex  gap-4 justify-center">
          <div className="flex items-center gap-2 p-4 bg-white shadow-md rounded-lg  hover:bg-blue-100">
            <p className="text-[#585858] text-[15px]">
              Suggest beautiful places on our road trip
            </p>
            <img width={30} src={assets.compass_icon} alt="compass" />
          </div>
          <div className="flex items-center gap-2 p-4 bg-white shadow-md rounded-lg hover:bg-blue-100">
            <p className="text-[#585858] text-[15px]">
              Suggest beautiful places on our road trip
            </p>
            <img width={30} src={assets.bulb_icon} alt="compass" />
          </div>
          <div className="flex items-center gap-2 p-4 bg-white shadow-md rounded-lg hover:bg-blue-100">
            <p className="text-[#585858] text-[15px]">
              Suggest beautiful places on our road trip
            </p>
            <img width={30} src={assets.message_icon} alt="compass" />
          </div>
          <div className="flex items-center gap-2 p-4 bg-white shadow-md rounded-lg hover:bg-blue-100">
            <p className="text-[#585858] text-[15px]">
              Suggest beautiful places on our road trip
            </p>
            <img width={30} src={assets.code_icon} alt="compass" />
          </div>
        </div>

        {/* bottom */}
        <div className="mt-24">
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-md">
            <input
              className="flex-1 p-1 outline-none"
              type="text"
              placeholder="Ask anything..."
            />
            <div className="flex items-center gap-3">
              <img width={20} src={assets.gallery_icon} alt="gallery" />
              <img width={20} src={assets.mic_icon} alt="mic" />
              <img width={20} src={assets.send_icon} alt="send" />
            </div>
          </div>
          <p className="mt-8 text-xs text-gray-500">
            Gemini may display inaccurate information, including about people,
            so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
}
