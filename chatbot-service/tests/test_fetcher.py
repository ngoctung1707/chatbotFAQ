from crawler.fetcher import Fetcher

fetcher = Fetcher()

html = fetcher.fetch(
    url="https://fintech.hust.edu.vn/about/welcome-message",
    page_type="about",
)

print(len(html))
