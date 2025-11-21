
from playwright.sync_api import sync_playwright
import time

def verify_dice(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173/login", timeout=60000)

    # Check if we are already logged in (redirected to dashboard)
    if page.url == "http://localhost:5173/":
        print("Already logged in.")
    else:
        print("Logging in...")
        # Wait for form to be visible
        page.wait_for_selector("input[type='email']", state="visible")

        page.fill("input[type='email']", "test@example.com")
        page.fill("input[type='password']", "password123")
        page.click("button[type='submit']")

        # Wait for navigation
        page.wait_for_url("http://localhost:5173/", timeout=30000)

    print("On Dashboard. Finding a room...")

    # Try to find an existing room card
    try:
        # Wait for room list to populate
        page.wait_for_selector("a[href^='/room/']", timeout=5000)
        page.click("a[href^='/room/']", timeout=2000)
        print("Clicked existing room.")
    except:
        print("No room found. Creating one requires DB interaction which is hard.")
        # Force navigate to a room ID (user 'test' might not have access, but let's try)
        page.goto("http://localhost:5173/room/test-room-123")

    print("In Room. Waiting for load...")
    time.sleep(5) # Wait for component load

    # Check if we were redirected (access denied)
    if page.url == "http://localhost:5173/":
         print("Access denied to room. Cannot verify dice.")
         return

    # Look for Dice Tab (it might be active by default)
    # Just look for d20 button
    try:
        page.wait_for_selector("button", state="visible")
        # Find button with text 'd20' inside a span probably
        d20 = page.locator("button").filter(has_text="d20").first
        if d20.is_visible():
            print("Found d20 button. Interacting...")
            d20.click()
            time.sleep(0.5)
            d20.click()

            # d6
            page.locator("button").filter(has_text="d6").first.click()

            # Check Roll Button
            roll_btn = page.locator("button").filter(has_text="AT").first
            if roll_btn.is_visible():
                print("Roll button appeared.")
                page.screenshot(path="/home/jules/verification/dice_ready.png")
                roll_btn.click()
                print("Rolled.")
                time.sleep(3)
                page.screenshot(path="/home/jules/verification/dice_result.png")
            else:
                print("Roll button NOT found.")
                page.screenshot(path="/home/jules/verification/dice_fail.png")
        else:
            print("d20 button not found.")
            page.screenshot(path="/home/jules/verification/room_view.png")

    except Exception as e:
        print(f"Interaction failed: {e}")
        page.screenshot(path="/home/jules/verification/error_room.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dice(page)
        except Exception as e:
            print(f"Global Error: {e}")
        finally:
            browser.close()
