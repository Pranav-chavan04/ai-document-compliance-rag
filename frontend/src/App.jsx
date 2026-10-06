import PdfUpload from "./components/PdfUpload";
import AskQuestion from "./components/AskQuestion";

function App() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
          <h1 className="font-semibold">
            AI Document Compliance Assistant
          </h1>
          <span className="text-xs text-gray-500">
            RAG · LangChain · Gemini
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Chat with your PDFs
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl">
            Upload a document, it gets split into chunks and stored in a
            vector database. Then ask questions and get answers grounded
            in the document.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] items-start">
          <PdfUpload />
          <AskQuestion />
        </div>

      </main>

    </div>
  );
}

export default App;
