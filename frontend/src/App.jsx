

import { useState } from "react";
import PdfUpload from "./components/PdfUpload";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      // Handle both string and object responses
      let finalAnswer = "";

      if (typeof data.answer === "string") {
        finalAnswer = data.answer;
      } else if (data.answer?.text) {
        finalAnswer = data.answer.text;
      } else {
        finalAnswer = JSON.stringify(
          data.answer,
          null,
          2
        );
      }

      setAnswer(finalAnswer);

    } catch (error) {
      console.error("ASK AI ERROR:", error);

      setAnswer(
        "The AI service is temporarily unavailable. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      askAI();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="
              w-10 h-10
              rounded-xl
              bg-linear-to-br
              from-blue-500
              to-purple-600
              flex
              items-center
              justify-center
              font-bold
              text-lg
            ">
              AI
            </div>

            <div>
              <h1 className="font-semibold text-lg">
                DocuMind
              </h1>

              <p className="text-xs text-gray-500">
                AI Document Assistant
              </p>
            </div>

          </div>

          <div className="
            hidden
            sm:flex
            items-center
            gap-2
            text-sm
            text-gray-400
          ">
            <span className="
              w-2
              h-2
              rounded-full
              bg-green-500
            " />

            RAG Assistant
          </div>

        </div>

      </nav>


      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <section className="text-center mb-12">

          <div className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            border
            border-blue-500/20
            bg-blue-500/10
            text-blue-400
            text-sm
            mb-6
          ">
            <span>✦</span>

            Powered by Retrieval Augmented Generation
          </div>


          <h2 className="
            text-4xl
            sm:text-5xl
            font-bold
            tracking-tight
          ">

            Chat with your

            <span className="
              text-transparent
              bg-clip-text
              bg-linear-to-r
              from-blue-400
              to-purple-500
            ">
              {" "}documents.
            </span>

          </h2>


          <p className="
            mt-5
            text-gray-400
            max-w-2xl
            mx-auto
            text-lg
          ">
            Upload a PDF and ask questions about its contents.
            Get answers grounded in your document.
          </p>

        </section>


        {/* PDF UPLOAD */}
        <section className="mb-8">
          <PdfUpload />
        </section>


        {/* QUESTION SECTION */}
        <section className="
          bg-[#111113]
          border
          border-white/10
          rounded-2xl
          p-5
          shadow-2xl
        ">

          <div className="
            flex
            items-center
            justify-between
            mb-4
          ">

            <div>

              <h3 className="font-semibold text-lg">
                Ask your document
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Ask anything about the uploaded PDF.
              </p>

            </div>

          </div>


          {/* TEXTAREA */}
          <div className="relative">

            <textarea
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="What would you like to know?"
              rows={5}
              className="
                w-full
                resize-none
                rounded-xl
                bg-[#09090b]
                border
                border-white/10
                px-4
                py-4
                text-white
                placeholder:text-gray-600
                outline-none
                focus:border-blue-500/50
                focus:ring-2
                focus:ring-blue-500/10
                transition
              "
            />

            <div className="
              absolute
              bottom-3
              right-3
              text-xs
              text-gray-600
            ">
              Ctrl + Enter
            </div>

          </div>


          {/* ASK BUTTON */}
          <div className="
            flex
            justify-end
            mt-4
          ">

            <button
              onClick={askAI}
              disabled={
                loading ||
                !question.trim()
              }
              className="
                px-6
                py-3
                rounded-xl
                bg-linear-to-r
                from-blue-600
                to-purple-600
                font-medium
                transition
                hover:from-blue-500
                hover:to-purple-500
                disabled:opacity-40
                disabled:cursor-not-allowed
                shadow-lg
                shadow-blue-500/10
              "
            >

              {loading ? (

                <span className="
                  flex
                  items-center
                  gap-2
                ">

                  <span className="
                    w-4
                    h-4
                    border-2
                    border-white/30
                    border-t-white
                    rounded-full
                    animate-spin
                  " />

                  Thinking...

                </span>

              ) : (

                <span className="
                  flex
                  items-center
                  gap-2
                ">

                  Ask AI

                  <span>
                    →
                  </span>

                </span>

              )}

            </button>

          </div>

        </section>


        {/* ANSWER */}
        {answer && (

          <section className="mt-8">

            <div className="
              flex
              items-center
              gap-3
              mb-4
            ">

              <div className="
                w-9
                h-9
                rounded-lg
                bg-linear-to-br
                from-blue-500
                to-purple-600
                flex
                items-center
                justify-center
                text-sm
                font-bold
              ">
                AI
              </div>


              <div>

                <h3 className="font-semibold">
                  AI Response
                </h3>

                <p className="text-xs text-gray-500">
                  Generated from your document
                </p>

              </div>

            </div>


            <div className="
              bg-[#111113]
              border
              border-white/10
              rounded-2xl
              p-6
            ">

              <p className="
                text-gray-300
                leading-8
                whitespace-pre-wrap
              ">
                {answer}
              </p>

            </div>

          </section>

        )}


        {/* FEATURES */}
        {!answer && (

          <section className="
            grid
            sm:grid-cols-3
            gap-4
            mt-10
          ">

            <Feature
              icon="📄"
              title="Upload PDFs"
              text="Add your documents and build a searchable knowledge base."
            />

            <Feature
              icon="🔍"
              title="Smart Retrieval"
              text="Relevant document sections are retrieved before answering."
            />

            <Feature
              icon="🤖"
              title="AI Answers"
              text="Ask natural-language questions about your documents."
            />

          </section>

        )}

      </main>


      {/* FOOTER */}
      <footer className="
        border-t
        border-white/10
        mt-20
      ">

        <div className="
          max-w-6xl
          mx-auto
          px-6
          py-6
          flex
          flex-col
          sm:flex-row
          justify-between
          items-center
          gap-3
          text-sm
          text-gray-600
        ">

          <p>
            DocuMind · AI Document Assistant
          </p>

          <p>
            Built with React · Node.js · FastAPI · RAG
          </p>

        </div>

      </footer>

    </div>
  );
}


function Feature({
  icon,
  title,
  text,
}) {

  return (

    <div className="
      bg-[#111113]
      border
      border-white/10
      rounded-2xl
      p-5
      hover:border-white/20
      transition
    ">

      <div className="text-2xl mb-4">
        {icon}
      </div>

      <h3 className="font-semibold mb-2">
        {title}
      </h3>

      <p className="
        text-sm
        text-gray-500
        leading-6
      ">
        {text}
      </p>

    </div>

  );
}


export default App;