import requests
from bs4 import BeautifulSoup


def search_arxiv(query: str):
    """
    Search ArXiv for papers matching the query.

    Args:
        query (str): Search query string.

    Returns:
        list: A list of dictionaries containing paper details.
    """
    # Base URL for ArXiv search
    base_url = "https://arxiv.org/search/"
    params = {
        "query": query,  # The query string for the search
        "searchtype": "all",  # Search across all fields
        "source": "header",  # Search initiated from the header
    }

    # Send a GET request to the ArXiv search page
    response = requests.get(base_url, params=params)
    response.raise_for_status()  # Raise an exception for HTTP errors

    # Parse the HTML content of the response
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract paper details
    results = []
    for item in soup.find_all("li", class_="arxiv-result"):
        # Extract the paper title
        title_element = item.find("p", class_="title")
        title = title_element.get_text(
            strip=True) if title_element else "No title available"

        # Extract the authors
        authors_element = item.find("p", class_="authors")
        authors = authors_element.get_text(
            strip=True) if authors_element else "No authors listed"

        # Extract the abstract
        abstract_element = item.find("p", class_="abstract")
        abstract = abstract_element.get_text(
            strip=True) if abstract_element else "No abstract available"

        # Extract the PDF link
        pdf_link_element = item.find("a", string="pdf")
        pdf_url = f"{pdf_link_element['href']}" if pdf_link_element else "No PDF available"

        # Append the extracted details to the results list
        results.append({
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "pdf_url": pdf_url,
        })

    return results
