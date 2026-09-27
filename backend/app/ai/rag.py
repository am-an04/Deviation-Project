import os
import re
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("qms.ai.rag")

KNOWLEDGE_BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "knowledge_base")
)
CHROMA_PERSIST_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "chroma_data")
)

COLLECTION_NAME = "mvp_severity_guidelines"

_chroma_client = None
_chroma_collection = None
_in_memory_chunks: List[Dict[str, str]] = []

def load_and_chunk_documents() -> List[Dict[str, str]]:
    """
    Reads markdown documents from backend/knowledge_base/
    and chunks them logically by section/header.
    """
    chunks: List[Dict[str, str]] = []
    if not os.path.exists(KNOWLEDGE_BASE_DIR):
        logger.warning(f"Knowledge base directory not found at: {KNOWLEDGE_BASE_DIR}")
        return chunks

    for fname in sorted(os.listdir(KNOWLEDGE_BASE_DIR)):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(KNOWLEDGE_BASE_DIR, fname)
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            # Split by markdown H2/H3 headers (## or ###)
            sections = re.split(r"(?m)^(?=###?\s+)", content)
            for sec in sections:
                sec = sec.strip()
                if not sec or len(sec) < 40:
                    continue

                # Extract title from the first header line
                first_line = sec.split("\n")[0].strip("# ").strip()
                title = f"{first_line} ({fname.replace('.md', '').replace('_', ' ').title()})"
                chunks.append({
                    "id": f"{fname}_{len(chunks)}",
                    "title": title,
                    "content": sec,
                    "source": fname
                })
        except Exception as e:
            logger.error(f"Error reading knowledge base file {fname}: {e}")

    logger.info(f"Loaded and chunked {len(chunks)} sections from knowledge base.")
    return chunks

def init_vector_store() -> bool:
    """
    Initializes ChromaDB vector store and populates it with knowledge base chunks.
    Falls back gracefully to in-memory semantic scoring if ChromaDB is not available.
    """
    global _chroma_client, _chroma_collection, _in_memory_chunks
    chunks = load_and_chunk_documents()
    _in_memory_chunks = chunks

    try:
        import chromadb
        from chromadb.config import Settings

        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False)
        )
        _chroma_collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "MVP Severity Assessment Guidance"}
        )

        # Check existing count
        existing_count = _chroma_collection.count()
        if existing_count < len(chunks):
            # Upsert all chunks
            ids = [c["id"] for c in chunks]
            documents = [c["content"] for c in chunks]
            metadatas = [{"title": c["title"], "source": c["source"]} for c in chunks]
            _chroma_collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Indexed {len(chunks)} chunks into ChromaDB collection '{COLLECTION_NAME}'.")
        else:
            logger.info(f"ChromaDB collection '{COLLECTION_NAME}' already populated with {existing_count} items.")
        return True

    except Exception as e:
        logger.warning(
            f"ChromaDB initialization encountered {e}. "
            "Using in-memory fast retrieval fallback for MVP Severity Assessment Guidance."
        )
        return False

def retrieve_guidance(query: str, top_k: int = 3) -> List[Dict[str, str]]:
    """
    Retrieves the most relevant MVP Severity Assessment Guidance chunks
    matching the reviewed deviation context.
    """
    global _chroma_collection, _in_memory_chunks
    if not query or not query.strip():
        return []

    # If ChromaDB is initialized and ready
    if _chroma_collection is not None:
        try:
            results = _chroma_collection.query(
                query_texts=[query],
                n_results=min(top_k, max(1, _chroma_collection.count()))
            )
            retrieved: List[Dict[str, str]] = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                for doc, meta in zip(docs, metas):
                    retrieved.append({
                        "title": meta.get("title", "MVP Severity Guidance"),
                        "content": doc.strip()
                    })
                return retrieved
        except Exception as e:
            logger.warning(f"Chroma query failed ({e}); falling back to in-memory retrieval.")

    # Graceful fallback: term-frequency matching over _in_memory_chunks
    if not _in_memory_chunks:
        _in_memory_chunks = load_and_chunk_documents()

    if not _in_memory_chunks:
        return []

    query_terms = set(re.findall(r"\w+", query.lower()))
    scored_chunks = []
    for c in _in_memory_chunks:
        content_lower = c["content"].lower()
        score = sum(content_lower.count(t) for t in query_terms if len(t) > 3)
        # Prioritize matching severity levels mentioned in title or text
        for sev in ["minor", "moderate", "major", "critical"]:
            if sev in query.lower() and sev in content_lower:
                score += 5
        scored_chunks.append((score, c))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    return [
        {"title": c["title"], "content": c["content"]}
        for _, c in scored_chunks[:top_k]
    ]
