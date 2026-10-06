from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from .rag import ask_rag, process_pdf


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "data/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "AI service is running"
    }


@app.post("/ask")
def ask(data: dict):

    question = data["question"]

    answer = ask_rag(question)

    return {
        "question": question,
        "answer": answer
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        return {
            "message": "Only PDF files are allowed"
        }

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    chunks = process_pdf(file_path)

    return {
        "message": "PDF uploaded and processed successfully",
        "filename": file.filename,
        "chunks": chunks
    }