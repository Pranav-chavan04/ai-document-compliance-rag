from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil
import os

from .rag import ask_rag, process_pdf


app = FastAPI()

# Comma-separated list of frontend URLs allowed to call this API,
# e.g. "http://localhost:5173,https://my-app.vercel.app"
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# p2/data/uploads, no matter which folder the server is started from
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "data" / "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "AI service is running"
    }


@app.post("/ask")
def ask(data: Question):

    question = data.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    answer = ask_rag(question)

    return {
        "question": question,
        "answer": answer
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    # keep only the file name, so "../../x.pdf" can't escape the uploads folder
    filename = os.path.basename(file.filename or "")

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    chunks = process_pdf(str(file_path))

    return {
        "message": "PDF uploaded and processed successfully",
        "filename": filename,
        "chunks": chunks
    }
