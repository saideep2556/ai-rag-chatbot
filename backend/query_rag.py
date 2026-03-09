import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vector_db = Chroma(
    collection_name="documents",
    persist_directory="./chroma_db",
    embedding_function=embedding_model
)

# Groq LLM (replaces Ollama)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

prompt = PromptTemplate.from_template("""
You are a helpful assistant. Use ONLY the context below to answer the question.
If the context is empty or irrelevant, say "No relevant information found in the document."

Context:
{context}

Question: {question}

Answer:""")

# Tracks the currently active filename
_active_filename: str | None = None

def set_active_file(filename: str):
    global _active_filename
    _active_filename = filename
    print(f"[INFO] Active file set to: {filename}")

def format_docs(docs):
    print(f"[DEBUG] Retrieved {len(docs)} chunks from '{_active_filename}'")
    for d in docs:
        print(f"[DEBUG] Chunk (file={d.metadata.get('filename','?')}): {d.page_content[:100]}")
    return "\n\n".join(doc.page_content for doc in docs)

def get_retriever():
    if _active_filename:
        return vector_db.as_retriever(
            search_kwargs={
                "k": 3,
                "filter": {"filename": {"$eq": _active_filename}}
            }
        )
    return vector_db.as_retriever(search_kwargs={"k": 3})

def ask_question(question: str):
    if not _active_filename:
        return "Please upload a document first before asking questions."

    retriever = get_retriever()

    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain.invoke(question)