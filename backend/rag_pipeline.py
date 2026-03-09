from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# vector database
vector_db = Chroma(
    collection_name="documents",
    embedding_function=embedding_model,
    persist_directory="./chroma_db"
)


def process_documents(documents, filename: str):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.split_documents(documents)

    # Tag every chunk with the source filename
    for chunk in chunks:
        chunk.metadata["filename"] = filename

    vector_db.add_documents(chunks)
    return len(chunks)