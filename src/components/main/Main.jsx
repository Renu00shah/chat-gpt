import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

export default function Main() {
  const {
    prevPrompts,
    setPrevPrompts,
    onSent,
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    showResult,
    loading,
    resultData,
  } = useContext(Context);
  // console.log("resultData:", resultData);

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      {/* Top Section */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-gray-600 text-lg font-medium">Gemini</p>
        <img
          className="rounded-full"
          width={40}
          src={assets.user_icon}
          alt="gem"
        />
      </div>

      {/* Greeting & Prompt Section */}
      {!showResult ? (
        <div className="text-[36px] text-[#c4c7c5] font-medium p-6 text-center">
          <p>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Hello, Dev
            </span>
          </p>
          <p className="text-lg text-gray-500">How can I help you today?</p>

          {/* Suggestion Cards */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              {
                text: "Suggest beautiful places on our road trip",
                icon: assets.compass_icon,
              },
              {
                text: "Get innovative ideas for a project",
                icon: assets.bulb_icon,
              },
              {
                text: "Explain complex concepts simply",
                icon: assets.message_icon,
              },
              { text: "Generate some code snippets", icon: assets.code_icon },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-4 bg-white shadow-md rounded-lg hover:bg-blue-100 w-[300px]"
              >
                <p className="text-[#585858] text-[15px]">{item.text}</p>
                <img width={30} src={item.icon} alt="icon" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 p-6">
          {/* User Query */}
          <div className="flex items-center gap-4 w-full max-w-[800px] bg-gray-100 p-4 rounded-lg shadow">
            <img
              className="w-10 h-10 rounded-full"
              src={assets.user_icon}
              alt="User"
            />
            <p className="text-gray-800">{recentPrompt}</p>
          </div>

          {/* Gemini Response */}
          <div className="flex items-start gap-4 w-full max-w-[800px] bg-white p-4 rounded-lg shadow">
            <img
              className="w-10 h-10 rounded-full"
              src={assets.gemini_icon}
              alt="Gemini"
            />
            <div className="text-gray-800">
              {!loading ? (
                <p
                  className="text-[17px] font-extralight leading-[1.8]"
                  dangerouslySetInnerHTML={{ __html: resultData }}
                ></p>
              ) : (
                <p className="text-gray-500">loading response...</p>
                // <div className="flex flex-col gap-2 w-full">
                //   <hr className="h-3 w-full rounded-md bg-gradient-to-r from-[#9ed7ff] via-[#ffffff] to-[#9ed7ff]" />
                //   <hr className="h-3 w-4/5 rounded-md bg-gradient-to-r from-[#9ed7ff] via-[#ffffff] to-[#9ed7ff]" />
                //   <hr className="h-3 w-3/5 rounded-md bg-gradient-to-r from-[#9ed7ff] via-[#ffffff] to-[#9ed7ff]" />
                // </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="mt-16">
        <div className="flex items-center bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="flex-1 p-2 outline-none text-gray-700"
            type="text"
            placeholder="Ask anything..."
          />
          <div className="flex items-center gap-3">
            <img
              width={20}
              src={assets.gallery_icon}
              alt="gallery"
              className="cursor-pointer"
            />
            <img
              width={20}
              src={assets.mic_icon}
              alt="mic"
              className="cursor-pointer"
            />
            <img
              onClick={onSent}
              width={20}
              src={assets.send_icon}
              alt="send"
              className="cursor-pointer"
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Gemini may display inaccurate information, including about people, so
          double-check its responses.
        </p>
      </div>
    </div>
  );
}
