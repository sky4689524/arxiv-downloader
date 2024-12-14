from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from download import download_pdf_file, download_all_files
from papers import fetch_arxiv_papers
from typing import List
from search import search_arxiv

# Initialize FastAPI application
app = FastAPI()

# Configure CORS to allow communication between backend and frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.post("/download_all_pdfs")
async def download_all_pdfs(payload: List[List[str]], background_tasks: BackgroundTasks):
    """
    Endpoint to download multiple PDFs and return them as a ZIP file.
    Args:
        payload (List[List[str]]): List of PDF URLs and titles to download.
        background_tasks (BackgroundTasks): Background task manager for handling file downloads.
    Returns:
        Response: ZIP file containing the requested PDFs.
    """
    return download_all_files(payload, background_tasks)


@app.get("/download_pdf")
def download_pdf(pdf_url: str, filename: str, background_tasks: BackgroundTasks):
    """
    Fetch and stream a single PDF file with a download prompt.
    Args:
        pdf_url (str): URL of the PDF to download.
        filename (str): Desired filename for the downloaded PDF.
        background_tasks (BackgroundTasks): Background task manager for file streaming.
    Returns:
        FileResponse: PDF file streamed for download.
    """
    return download_pdf_file(pdf_url, filename, background_tasks)


@app.get("/arxiv_papers")
def get_arxiv_papers(
    category: str = Query("cs.AI", description="Category of papers to fetch"),
    skip: int = Query(0, description="Number of entries to skip")
):
    """
    Endpoint to fetch a list of arXiv papers for a specific category and page.
    Args:
        category (str): The arXiv category to fetch papers from (e.g., "cs.AI").
        skip (int): Number of entries to skip for pagination.
    Returns:
        dict: Data containing the fetched arXiv papers.
    """
    data = fetch_arxiv_papers(category, skip)
    return data


@app.get("/search")
def search_papers(query: str = Query(..., description="Search query string")):
    """
    Endpoint to search arXiv for papers matching a query.
    Args:
        query (str): Search query string.
    Returns:
        dict: Search results or error message if an exception occurs.
    """
    try:
        results = search_arxiv(query)
        return {"query": query, "results": results}
    except Exception as e:
        return {"error": str(e)}
