import { useRef, useState } from "react";

export default function UploadPanel({ uploadedFile, setUploadedFile }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://ai-rag-chatbot-yqgj.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadedFile({ name: file.name, chunks: data.chunks_stored ?? "?" });
    } catch {
      setError("Upload failed. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="upload-section">
      <p className="upload-label">Document</p>
      <div
        className={`dropzone ${uploading ? "uploading" : ""} ${uploadedFile ? "done" : ""}`}
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.docx"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {uploading ? (
          <p className="drop-text">Uploading...</p>
        ) : uploadedFile ? (
          <div className="upload-success">
            <span className="check">✓</span>
            <p className="file-name">{uploadedFile.name}</p>
            <p className="chunk-info">{uploadedFile.chunks} chunks indexed</p>
          </div>
        ) : (
          <div className="drop-prompt">
            <span className="upload-icon">⊕</span>
            <p className="drop-text">Drop file or click to upload</p>
            <p className="drop-sub">PDF, TXT, DOCX</p>
          </div>
        )}
      </div>
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
