const puppeteer = require("puppeteer");

async function scrapeHospitals() {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto("https://howlongwilliwait.com/", { waitUntil: "networkidle2" });

    // Wait for the hospital list to load
    await page.waitForSelector(".hospital-list .hospital-item", { timeout: 10000 });

    // Extract hospital names and wait times
    const hospitals = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".hospital-list .hospital-item"));
      return items.map(item => {
        const name = item.querySelector(".hospital-name")?.innerText.trim() || "Unknown Hospital";
        const waitTime = item.querySelector(".wait-time-value")?.innerText.trim() || "N/A";
        return { name, wait_time: waitTime };
      });
    });

    // Close browser
    await browser.close();

    // Log the extracted data
    console.log("🏥 Hospital Wait Times:", hospitals);
  } catch (error) {
    console.error("❌ Error scraping hospital data:", error);
  }
}

// Run the scraper
scrapeHospitals();
