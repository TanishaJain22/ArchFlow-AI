import os
from utils.logger import get_logger

logger = get_logger(__name__)


class RAGEngine:
    """Lightweight RAG engine that gracefully degrades when ML packages are unavailable."""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.vector_store = None
        self.embeddings = None
        self._initialized = False
        self._available = False

    def initialize(self):
        if self._initialized:
            return
        self._initialized = True

        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"}
            )
            self._initialize_index()
            self._available = True
            logger.info("RAG initialized successfully with embeddings.")
        except ImportError as e:
            logger.warning(f"RAG dependencies not installed (lightweight mode): {e}")
            self.embeddings = None
        except Exception as e:
            logger.warning(f"RAG fallback mode — initialization failed: {e}")
            self.embeddings = None

    def _initialize_index(self):
        if not self.embeddings:
            logger.warning("Embeddings not initialized. Skipping FAISS index creation.")
            return

        try:
            from langchain_community.document_loaders import DirectoryLoader, TextLoader
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            from langchain_community.vectorstores import FAISS
        except ImportError as e:
            logger.warning(f"FAISS/loader dependencies not installed: {e}")
            return

        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            logger.warning(f"Data directory {self.data_dir} was missing and created.")
            return

        loader = DirectoryLoader(self.data_dir, glob="**/*.txt", loader_cls=TextLoader)
        docs = loader.load()

        if not docs:
            logger.warning("No documents found in data directory.")
            return

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        splits = text_splitter.split_documents(docs)

        self.vector_store = FAISS.from_documents(splits, self.embeddings)
        logger.info(f"Initialized FAISS index with {len(splits)} chunks from {len(docs)} txt documents.")

    def get_relevant_context(self, query: str, k: int = 3) -> str:
        """Returns RAG context if available, empty string otherwise."""
        if not self._initialized:
            self.initialize()
        try:
            if not self.vector_store:
                return ""
            docs = self.vector_store.similarity_search(query, k=k)
            context = "\n\n".join([doc.page_content for doc in docs])
            return context
        except Exception as e:
            logger.error(f"Error retrieving RAG context: {e}")
            return ""


# Singleton instance
rag_engine = RAGEngine()
