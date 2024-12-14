import os
import requests
import zipfile
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile
from fastapi import BackgroundTasks
from typing import List
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def sanitize_filename(filename: str) -> str:
    """
    Remove or replace invalid characters in a filename to ensure it is safe for saving.
    Args:
        filename (str): Original filename.
    Returns:
        str: Sanitized filename.
    """
    return re.sub(r'[<>:"/\\|?*]', '_', filename)


def download_all_files(payload: List[List[str]], background_tasks: BackgroundTasks) -> FileResponse:
    """
    Download multiple PDF files, compress them into a ZIP archive, and return the ZIP file as a response.
    Args:
        payload (List[List[str]]): List of [pdf_url, title] pairs to download.
        background_tasks (BackgroundTasks): Background task manager for cleanup.
    Returns:
        FileResponse: ZIP file containing all requested PDFs.
    """
    output_dir = "download"
    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)
    zip_file_path = os.path.join(output_dir, "papers.zip")

    try:
        with zipfile.ZipFile(zip_file_path, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
            for idx, (pdf_url, title) in enumerate(payload):
                sanitized_title = sanitize_filename(title)
                pdf_path = os.path.join(output_dir, f"{sanitized_title}.pdf")
                try:
                    response = requests.get(pdf_url)
                    response.raise_for_status()
                except requests.RequestException as e:
                    logger.error(f"Failed to download {pdf_url}: {e}")
                    continue

                with open(pdf_path, "wb") as pdf_file:
                    pdf_file.write(response.content)

                logger.info(f"Added {sanitized_title} to the ZIP file.")
                zip_file.write(pdf_path, arcname=f"{sanitized_title}.pdf")

        logger.info(
            "All files have been compressed and added to the ZIP archive.")
        background_tasks.add_task(cleanup_directory, output_dir)

        return FileResponse(zip_file_path, media_type="application/zip", filename="papers.zip")

    except Exception as e:
        logger.error(f"An error occurred during processing: {e}")
        cleanup_directory(output_dir)
        raise


def cleanup_directory(directory: str):
    """
    Remove all files and subdirectories in the specified directory.
    Args:
        directory (str): Path of the directory to clean up.
    """
    for root, dirs, files in os.walk(directory, topdown=False):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                os.remove(file_path)
                logger.info(f"Deleted file: {file_path}")
            except Exception as e:
                logger.error(f"Failed to delete file {file_path}: {e}")

        for dir in dirs:
            dir_path = os.path.join(root, dir)
            try:
                os.rmdir(dir_path)
                logger.info(f"Deleted directory: {dir_path}")
            except Exception as e:
                logger.error(f"Failed to delete directory {dir_path}: {e}")

    try:
        os.rmdir(directory)
        logger.info(f"Deleted directory: {directory}")
    except Exception as e:
        logger.error(f"Failed to delete directory {directory}: {e}")


def download_pdf_file(pdf_url: str, filename: str, background_tasks: BackgroundTasks) -> FileResponse:
    """
    Fetch a PDF file from a URL, save it temporarily, and return it as a response.
    Args:
        pdf_url (str): URL of the PDF to download.
        filename (str): Desired filename for the PDF.
        background_tasks (BackgroundTasks): Background task manager for cleanup.
    Returns:
        FileResponse: Streamed response of the downloaded PDF.
    """
    response = requests.get(pdf_url)
    response.raise_for_status()

    with NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(response.content)
        temp_file_path = temp_file.name

    background_tasks.add_task(cleanup_file, temp_file_path)

    return FileResponse(temp_file_path, media_type="application/pdf", filename=f"{filename}.pdf")


def cleanup_file(file_path: str):
    """
    Remove a temporary file after it has been served.
    Args:
        file_path (str): Path to the temporary file to delete.
    """
    try:
        os.remove(file_path)
        logger.info(f"Temporary file removed: {file_path}")
    except OSError as e:
        logger.error(f"Error deleting temporary file {file_path}: {e}")
