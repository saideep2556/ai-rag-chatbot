export default function ChatMessage({ role, text, error }) {
  return (
    <div className={`message ${role} ${error ? "error" : ""}`}>
      {role === "assistant" && (
        <div className="avatar">◈</div>
      )}
      <div className="bubble">
        <p>{text}</p>
      </div>
      {role === "user" && (
        <div className="avatar user-avatar">U</div>
      )}
    </div>
  );
}
