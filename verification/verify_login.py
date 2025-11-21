
from playwright.sync_api import sync_playwright, expect

def verify_login_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173/login")

        # Check for key elements on the login page to ensure it loaded
        # Adjust selectors based on actual content.
        # Assuming there's a "Login" or "Giriş Yap" text or button.

        try:
            expect(page.get_by_role("button", name="Google ile Giriş Yap")).to_be_visible(timeout=10000)
            print("Login button visible")
        except:
            print("Login button not found, checking page content")
            print(page.content())

        # Take a screenshot
        page.screenshot(path="verification/login_page.png")
        print("Screenshot saved to verification/login_page.png")

        browser.close()

if __name__ == "__main__":
    verify_login_page()
