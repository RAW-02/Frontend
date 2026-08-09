import { useState } from "react";
import ChatPanel from "./ChatPanel";

export default function FloatingChatbot() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      {chatOpen && (
        <div
          className="
            fixed
            right-6
            bottom-24
            z-[100]
            w-[400px]
            h-[620px]
            max-h-[72vh]
            max-w-[calc(100vw-32px)]
          "
        >
          <ChatPanel onClose={() => setChatOpen(false)} />
        </div>
      )}

      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        aria-label={chatOpen ? "Close CyberBot" : "Open CyberBot"}
        className="
          fixed
          bottom-6
          right-6
          z-[101]
          h-16
          w-16
          rounded-2xl
          bg-cyan-600
          hover:bg-cyan-500
          text-white
          flex
          items-center
          justify-center
          shadow-2xl
          shadow-cyan-500/25
          transition-all
          duration-200
        "
      >
        <i
          className={`ti ${
            chatOpen ? "ti-x" : "ti-message-chatbot"
          } text-2xl`}
        />
      </button>
    </>
  );
}