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

  return (
    <div className="p-1 md:p-6 max-w-[900px] mx-auto w-full">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-lg font-medium">Gemini</p>
        <img
          className="rounded-full w-10 h-10"
          src={assets.user_icon}
          alt="User"
        />
      </div>

      {/* Greeting & Prompt Section */}
      {!showResult ? (
        <div className="text-center text-[#c4c7c5] font-medium mt-6">
          <p className="text-3xl md:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Hello, Dev
            </span>
          </p>
          <p className="text-2xl md:text-3xl text-gray-500 mt-2">
            How can I help you today?
          </p>

          {/* Suggestion Cards */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
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
                className="flex items-center justify-between gap-3 p-3 md:p-4 bg-white shadow-md rounded-lg hover:bg-blue-100 w-full sm:w-[300px]"
              >
                <p className="text-[#585858] text-sm md:text-[15px]">
                  {item.text}
                </p>
                <img width={30} src={item.icon} alt="icon" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 p-4 md:p-6">
          {/* User Query */}
          <div className="flex items-center gap-3 w-full max-w-[800px] bg-gray-100 p-3 md:p-4 rounded-lg shadow">
            <img
              className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              src={assets.user_icon}
              alt="User"
            />
            <p className="text-gray-800 text-sm md:text-base">{recentPrompt}</p>
          </div>

          {/* Gemini Response */}
          <div className="md:flex flex-row items-start gap-3 w-full max-w-[800px] bg-white p-3 md:p-4 rounded-lg shadow">
            <img
              className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              src={assets.gemini_icon}
              alt="Gemini"
            />
            <div className="text-gray-800 w-full overflow-hidden p-2">
              {!loading ? (
                <p
                  className="text-sm md:text-[17px] font-light leading-[1.6] md:leading-[1.8] break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: resultData }}
                ></p>
              ) : (
                <p className="text-gray-500">Loading response...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="mt-14">
        <div className="flex items-center bg-white p-2 md:p-3 rounded-lg shadow-md border border-gray-200">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="flex-1 p-2 text-sm md:text-base outline-none text-gray-700"
            type="text"
            placeholder="Ask anything..."
          />
          <div className="flex items-center gap-2 md:gap-3">
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
          Gemini may display inaccurate information, so double-check its
          responses.
        </p>
      </div>
    </div>
  );
}
