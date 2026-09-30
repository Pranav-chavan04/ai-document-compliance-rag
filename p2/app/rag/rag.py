import os
from pathlib import Path

from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


# ============================================================
# ENVIRONMENT
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

print("ENV FILE:", ENV_PATH)
print("GOOGLE API KEY FOUND:", bool(GOOGLE_API_KEY))


if not GOOGLE_API_KEY:
    raise ValueError(
        "GOOGLE_API_KEY not found. Check your .env file."
    )


# ============================================================
# EMBEDDINGS
# ============================================================

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# ============================================================
# CHROMA
# ============================================================

CHROMA_DIR = str(BASE_DIR / "chroma_db")


vector_store = Chroma(
    persist_directory=CHROMA_DIR,
    embedding_function=embeddings
)


# ============================================================
# TEXT SPLITTER
# ============================================================

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)


# ============================================================
# PROCESS PDF
# ============================================================

def process_pdf(pdf_path):

    print("PDF:", pdf_path)

    loader = PyPDFLoader(pdf_path)

    documents = loader.load()

    print("Pages:", len(documents))

    chunks = text_splitter.split_documents(documents)

    print("Chunks:", len(chunks))

    vector_store.add_documents(chunks)

    print("Documents added to Chroma!")

    return len(chunks)


# ============================================================
# RETRIEVER
# ============================================================

retriever = vector_store.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 5,
        "fetch_k": 20
    }
)


# ============================================================
# GEMINI
# ============================================================

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0
)


# ============================================================
# PROMPT
# ============================================================

prompt = ChatPromptTemplate.from_template("""
You are an AI assistant answering questions about uploaded PDF documents.

Use ONLY the provided context.

Do not use outside knowledge.

If the answer cannot be found in the provided context, say:

"I don't know based on the provided document."

Give a clear and concise answer.

Context:
-------------------------
{context}
-------------------------

Question:
{question}

Answer:
""")


# ============================================================
# RAG QUESTION ANSWERING
# ============================================================

def ask_rag(question):

    print("\n========================================")
    print("QUESTION:", question)
    print("========================================")

    # --------------------------------------------------------
    # RETRIEVE RELEVANT DOCUMENTS
    # --------------------------------------------------------

    results = retriever.invoke(question)

    print("Retrieved:", len(results))

    # --------------------------------------------------------
    # BUILD CONTEXT
    # --------------------------------------------------------

    context_parts = []

    for i, document in enumerate(results):

        page = document.metadata.get(
            "page",
            "unknown"
        )

        source = document.metadata.get(
            "source",
            "unknown"
        )

        print(
            f"\n========== CHUNK {i + 1} =========="
        )

        print("Source:", source)
        print("Page:", page)

        print(
            document.page_content[:1000]
        )

        context_parts.append(
            f"""
SOURCE: {source}
PAGE: {page}

{document.page_content}
"""
        )

    context = "\n".join(context_parts)

    print("\n========== CONTEXT ==========")
    print(context)

    # --------------------------------------------------------
    # CREATE PROMPT
    # --------------------------------------------------------

    final_prompt = prompt.invoke({
        "context": context,
        "question": question
    })

    # --------------------------------------------------------
    # CALL GEMINI
    # --------------------------------------------------------

    response = llm.invoke(final_prompt)

    print("\n========== RAW RESPONSE ==========")
    print(response.content)

    # --------------------------------------------------------
    # EXTRACT TEXT FROM GEMINI RESPONSE
    # --------------------------------------------------------

    content = response.content

    # Gemini may return:
    #
    # [
    #   {
    #       "type": "text",
    #       "text": "actual answer",
    #       "extras": {...}
    #   }
    # ]
    #
    # We only want the "text" field.

    if isinstance(content, list):

        text_parts = []

        for item in content:

            if isinstance(item, dict):

                if item.get("type") == "text":

                    text = item.get(
                        "text",
                        ""
                    )

                    if text:
                        text_parts.append(text)

        final_answer = "\n".join(text_parts)

        return final_answer

    # --------------------------------------------------------
    # NORMAL STRING RESPONSE
    # --------------------------------------------------------

    return str(content)