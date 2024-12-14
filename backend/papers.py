import requests
from bs4 import BeautifulSoup


def fetch_arxiv_papers(category="cs.AI", skip=0):
    """
    Fetch a list of papers from arXiv based on the specified category and skip parameter.

    Args:
        category (str): arXiv category to fetch papers from (e.g., "cs.AI").
        skip (int): Number of entries to skip for pagination.

    Returns:
        dict: Dictionary containing total entries, current skip, and a list of papers with details.
    """
    # URL of the arXiv page with the skip parameter
    url = f"https://arxiv.org/list/{category}/recent?skip={skip}&show=50"
    response = requests.get(url)
    content = response.text

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(content, "html.parser")

    # Extract total number of entries
    paging_div = soup.find("div", class_="paging")
    if paging_div:
        total_entries_text = paging_div.text.split(
            "Total of")[1].split("entries")[0].strip()
        total_entries = int(total_entries_text)
    else:
        total_entries = 0  # Default to 0 if no entries found

    # Initialize a list to store paper details
    papers = []

    # Extract paper details from the HTML
    for item in soup.find_all("dl"):  # Iterate over definition lists
        # Pair titles and descriptions
        for dt, dd in zip(item.find_all("dt"), item.find_all("dd")):
            paper_details = {}

            # Extract arXiv ID
            arxiv_link = dt.find("a", title="Abstract")
            if arxiv_link:
                arxiv_id = arxiv_link["id"].strip()
                paper_details["arxiv_id"] = arxiv_id

                # Construct PDF URL using the arXiv ID
                pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                paper_details["pdf_url"] = pdf_url

                # Extract Title
                title_element = dd.find(
                    "span", class_="descriptor", string="Title:")
                if title_element:
                    title = title_element.find_next_sibling(text=True).strip()
                    paper_details["title"] = title

                # Extract Authors
                authors_element = dd.find("div", class_="list-authors")
                if authors_element:
                    authors = ", ".join(a.text.strip()
                                        for a in authors_element.find_all("a"))
                    paper_details["authors"] = authors

                # Extract Subjects
                subjects_element = dd.find("div", class_="list-subjects")
                if subjects_element:
                    subjects = subjects_element.text.replace(
                        "Subjects:", "").strip()
                    paper_details["subjects"] = subjects

                # Append the extracted details to the papers list
                papers.append(paper_details)

    # Return the extracted data as a dictionary
    return {
        "total_entries": total_entries,
        "current_skip": skip,
        "papers": papers
    }
