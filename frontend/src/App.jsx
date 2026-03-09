import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import UploadPanel from "./UploadPanel";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! Upload a document and I'll answer any questions about it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `https://ai-rag-chatbot-yqgj.onrender.com/ask?question=${encodeURIComponent(question)}`
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Could not reach the server. Is the backend running?",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">RAG<em>chat</em></span>
          </div>
          <p className="sidebar-tagline">Document Intelligence</p>
        </div>
        <UploadPanel uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />
        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>Backend: localhost:8000</span>
        </div>
      </aside>

      <main className="chat-area">
        <div className="messages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} text={msg.text} error={msg.error} />
          ))}
          {loading && (
            <div className="message assistant">
              <div className="bubble thinking">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-bar">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something about your document..."
            rows={1}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
