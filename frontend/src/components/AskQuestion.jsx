import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AskQuestion() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();

    const text = question.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "error", text: `✕ ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      bg-[#111113]
      border border-white/10
      rounded-2xl
      p-6
      flex flex-col
      min-h-[420px]
    ">

      <div className="flex items-center gap-4 mb-5">

        <div className="
          w-12 h-12
          rounded-xl
          bg-blue-500/10
          border border-blue-500/20
          flex items-center justify-center
          text-xl
        ">
          💬
        </div>

        <div>
          <h2 className="font-semibold text-lg">
            Ask about your documents
          </h2>

          <p className="text-sm text-gray-500">
            Answers come only from the uploaded PDFs
          </p>
        </div>

      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-1">

        {messages.length === 0 && (
          <div className="text-sm text-gray-600 text-center py-10">
            Upload a PDF, then ask something like
            <br />
            <span className="text-gray-400">
              "What are the main compliance requirements?"
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`
              p-3
              rounded-lg
              text-sm
              whitespace-pre-wrap
              ${msg.role === "user"
                ? "bg-blue-500/10 border border-blue-500/20 ml-10"
                : msg.role === "error"
                  ? "bg-red-500/10 text-red-300"
                  : "bg-white/5 text-gray-300 mr-10"}
            `}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="p-3 rounded-lg bg-white/5 text-sm text-gray-500 mr-10">
            Searching the document...
          </div>
        )}

      </div>

      <form onSubmit={handleAsk} className="flex gap-2 mt-4">

        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          className="
            flex-1
            min-w-0
            px-4 py-3
            rounded-xl
            bg-white/5
            border border-white/10
            text-sm
            outline-none
            focus:border-blue-500/40
          "
        />

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="
            px-5
            rounded-xl
            bg-white
            text-black
            font-medium
            hover:bg-gray-200
            transition
            disabled:opacity-50
          "
        >
          Ask
        </button>

      </form>

    </div>
  );
}

export default AskQuestion;
