import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function PdfUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
  if (!file) {
    setMessage("Select a PDF first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setUploading(true);
  setMessage("");

  try {
    const response = await fetch(
      `${API_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || "Upload failed");
    }

    setMessage(
      `✓ ${data.filename} processed successfully · ${data.chunks} chunks`
    );

    if (onUploaded) onUploaded(data.filename);

  } catch (error) {
    console.error(error);
    setMessage(`✕ ${error.message}`);
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="
      bg-[#111113]
      border border-white/10
      rounded-2xl
      p-6
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
          📄
        </div>

        <div>
          <h2 className="font-semibold text-lg">
            Upload a document
          </h2>

          <p className="text-sm text-gray-500">
            PDF files only
          </p>
        </div>

      </div>

      <div className="
        border border-dashed border-white/15
        rounded-xl
        p-6
        text-center
        hover:border-blue-500/40
        transition
      ">

        <input
          type="file"
          accept=".pdf"
          id="pdf-upload"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setMessage("");
          }}
        />

        <label
          htmlFor="pdf-upload"
          className="cursor-pointer"
        >

          <div className="text-gray-400 mb-2">
            {file
              ? file.name
              : "Choose a PDF document"}
          </div>

          <div className="text-xs text-gray-600">
            Click to browse files
          </div>

        </label>

      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="
            w-full
            mt-4
            py-3
            rounded-xl
            bg-white
            text-black
            font-medium
            hover:bg-gray-200
            transition
            disabled:opacity-50
          "
        >
          {uploading
            ? "Processing document..."
            : "Process PDF"}
        </button>
      )}

      {message && (
        <div className="
          mt-4
          p-3
          rounded-lg
          bg-white/5
          text-sm
          text-gray-400
        ">
          {message}
        </div>
      )}

    </div>
  );
}

export default PdfUpload;