import { useState, useEffect, useRef } from "react";
import { getResponse, SUGGESTIONS } from "../../data/chatbot";
import { MessageCircle, BotIcon } from "lucide-react";
import styles from "./ChatBot.module.css";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: `Hi! I'm AeroBot 👋 Your AeroFind assistant.\n\nAsk me anything about flights, bookings, seats or passengers.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // focus input when chat opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function sendMessage(text) {
    const userText = text ?? input.trim();
    if (!userText) return;

    // add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "user", text: userText },
    ]);
    setInput("");
    setTyping(true);

    // simulate bot thinking delay
    setTimeout(() => {
      const response = getResponse(userText);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: response },
      ]);
    }, 600);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // format bot text — convert **bold** and \n to JSX
  function formatText(text) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  }

  return (
    <>
      {/* ── FLOATING BUBBLE ── */}
      <button
        className={`${styles.bubble} ${isOpen ? styles.bubbleOpen : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AeroBot chat"
      >
        {isOpen ? "✕" : <MessageCircle />}
      </button>

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div className={styles.window}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>
                <BotIcon />
              </div>
              <div>
                <div className={styles.botName}>AeroBot</div>
                <div className={styles.botStatus}>● Online</div>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.from === "user" ? styles.messageUser : styles.messageBot}`}
              >
                {msg.from === "bot" && (
                  <div className={styles.msgAvatar}>
                    <BotIcon size={15} />
                  </div>
                )}
                <div
                  className={`${styles.bubble2} ${msg.from === "user" ? styles.bubbleUser : styles.bubbleBot}`}
                >
                  {formatText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className={`${styles.message} ${styles.messageBot}`}>
                <div className={styles.msgAvatar}>✈</div>
                <div className={`${styles.bubble2} ${styles.bubbleBot}`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions — show only at the start */}
          {messages.length <= 1 && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className={styles.suggestion}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Ask AeroBot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
