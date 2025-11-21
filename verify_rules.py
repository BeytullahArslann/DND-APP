from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the rules page
        page.goto("http://localhost:5173/rules")

        # Wait for the content to load (Test Section from our mock or actual content)
        # The actual content has "Kurallar ve Oynanış"
        try:
            page.wait_for_selector("text=Kurallar ve Oynanış", timeout=10000)
        except:
            print("Timed out waiting for rules content. taking screenshot anyway.")

        page.screenshot(path="/home/jules/verification/rules_page.png")

        # Click on Spells tab
        page.get_by_text("Büyüler").click()

        # Wait for spells search
        page.wait_for_selector("input[placeholder='Büyü ara...']")

        page.screenshot(path="/home/jules/verification/spells_page.png")

        browser.close()

if __name__ == "__main__":
    run()
