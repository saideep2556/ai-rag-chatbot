from rag_pipeline import process_documents , vector_db
from fastapi import FastAPI, UploadFile, File
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware

from file_loader import load_pdf
from query_rag import ask_question, set_active_file


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-rag-chatbot-phi.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "RAG Chatbot API running"}


UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    documents = load_pdf(file_path)

    # Process with filename as metadata
    chunk_count = process_documents(documents, filename=file.filename)

    # Set this file as the active one for querying
    set_active_file(file.filename)

    return {
        "message": "File processed successfully",
        "filename": file.filename,
        "chunks_created": chunk_count
    }


@app.get("/ask")
def ask(question: str):
    answer = ask_question(question)
    return {
        "question": question,
        "answer": answer
    }

@app.get("/debug")
def debug():
    collection = vector_db.get()
    ids = collection["ids"]
    metadatas = collection["metadatas"]
    print(f"[DEBUG] Total chunks: {len(ids)}")
    for i, meta in enumerate(metadatas[:5]):
        print(f"[DEBUG] Chunk {i}: metadata={meta}")
    return {
        "total_chunks": len(ids),
        "sample_metadata": metadatas[:5]
    }