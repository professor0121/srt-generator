
"use client";

import { useState } from "react";

type Result = {
  srt: string;
  videoId: string;
};

export default function SrtGeneratorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/srt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result) return;

    const blob = new Blob([result.srt], {
      type: "text/plain;charset=utf-8",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `${result.videoId}.srt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0d10",
        color: "#e8e6e1",
        display: "flex",
        justifyContent: "center",
        padding: "64px 20px",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
        }}
      >
        <div style={{ marginBottom: 30 }}>
          <h1
            style={{
              fontSize: 36,
              marginBottom: 10,
            }}
          >
            YouTube SRT Generator
          </h1>

          <p
            style={{
              color: "#8a8780",
              fontSize: 14,
            }}
          >
            Paste a YouTube URL and generate subtitles (.srt).
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid #2a2e34",
              background: "#15181c",
              color: "#fff",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              background: loading
                ? "#444"
                : "linear-gradient(135deg,#ff8a3d,#ff4d8d)",
              color: "#000",
            }}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 8,
              background: "#2a1515",
              border: "1px solid #5c3030",
              color: "#ffb3b3",
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: 24,
              borderRadius: 10,
              border: "1px solid #2a2e34",
              background: "#111317",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <strong>Video ID:</strong> {result.videoId}
              </div>

              <button
                onClick={handleDownload}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #2e4a33",
                  background: "#1c2e1f",
                  color: "#7fe69a",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Download .srt
              </button>
            </div>

            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                maxHeight: 500,
                overflowY: "auto",
                fontSize: 13,
                lineHeight: 1.6,
                color: "#c9c6bf",
              }}
            >
              {result.srt}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
