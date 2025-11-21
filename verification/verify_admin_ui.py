
from playwright.sync_api import Page, expect, sync_playwright
import time

def test_admin_ui(page: Page):
    # 1. Navigate to Admin Dashboard
    # Assuming localhost:5173 is the vite default port
    page.goto("http://localhost:5173/admin")

    # Wait for load (auth might take a moment)
    time.sleep(2)

    # 2. Verify "Reset & Seed" button
    # It might need login if not in demo mode, but memory says defaults to demo if env missing.
    # The button text is 'Veritabanını Sıfırla ve Doldur (Reset & Seed)'
    reset_btn = page.get_by_role("button", name="Veritabanını Sıfırla ve Doldur")
    expect(reset_btn).to_be_visible()

    # Take screenshot of dashboard
    page.screenshot(path="verification/admin_dashboard.png")

    # 3. Navigate to Users Page
    page.goto("http://localhost:5173/admin/users")
    time.sleep(2)

    # 4. Verify Users Table
    expect(page.get_by_text("Kullanıcı Yönetimi")).to_be_visible()
    expect(page.get_by_role("table")).to_be_visible()

    # Take screenshot of users page
    page.screenshot(path="verification/users_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_admin_ui(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
