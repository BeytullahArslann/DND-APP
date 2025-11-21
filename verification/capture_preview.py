
from playwright.sync_api import sync_playwright
import time

def capture(page):
    print("Navigating to design preview...")
    page.goto("http://localhost:5173/design-preview", timeout=60000)

    print("Waiting for scene to load...")
    time.sleep(5) # Give 3D canvas time to initialize and settle

    print("Capturing screenshot...")
    page.screenshot(path="/home/jules/verification/design_preview.png", full_page=True)
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            capture(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_preview.png")
        finally:
            browser.close()
