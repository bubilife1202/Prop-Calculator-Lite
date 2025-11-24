from playwright.sync_api import sync_playwright

def verify_calculator_jpy():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate
        page.goto("http://localhost:3000")

        # Check title
        page.wait_for_selector("text=Risk Sniper")

        # Setup for JPY test
        page.fill("input[placeholder='10000']", "10000")
        page.fill("input[placeholder='1.0']", "1")
        page.fill("input[placeholder='10']", "10") # 10 pips SL

        # Select JPY checkbox
        page.check("input[id='is-jpy']")

        # Set Rate to 150
        # Wait for potential auto-update? No, we will manual set
        # Since API fetch might be async, let's just force input
        # Note: The input value might reset if we don't handle the state update well, but let's try.
        page.fill("input[value='150']", "150") # It might already be 150 due to default in my code, but good to be explicit.

        # Set Commission
        page.fill("input[placeholder='0.00']", "7")

        # Calculate
        page.click("button:has-text('Calculate Risk')")

        # Verify Results
        page.wait_for_selector("text=Recommended Position Size")

        # Screenshot
        page.screenshot(path="verification/calculator_jpy_check.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_calculator_jpy()
