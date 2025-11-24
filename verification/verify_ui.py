from playwright.sync_api import sync_playwright

def verify_calculator():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000")

        # Wait for the calculator to load
        page.wait_for_selector("text=Risk Sniper")

        # Input values
        page.fill("input[placeholder='10000']", "50000")
        page.fill("input[placeholder='1.0']", "1.5")
        page.fill("input[placeholder='10']", "25")

        # Select Asset Class (Forex is default, but let's verify others exist)
        # We just verify the calculator UI is visible

        # Click Calculate
        page.click("button:has-text('Calculate Risk')")

        # Wait for result
        page.wait_for_selector("text=Recommended Position Size")

        # Take screenshot
        page.screenshot(path="verification/calculator_check.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_calculator()
