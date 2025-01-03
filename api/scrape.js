const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

module.exports = async function (req, res) {
  let browser;

  try {
    // ✅ Launch headless Chromium on Railway
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://howlongwilliwait.com/", { waitUntil: "networkidle2" });

    // ✅ Wait for hospital list to load
    await page.waitForSelector(".hospital-list .hospital-item", { timeout: 10000 });

    // ✅ Scrape hospital names and wait times
    const hospitals = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".hospital-list .hospital-item")).map(item => ({
        name: item.querySelector(".hospital-name")?.innerText.trim() || "Unknown Hospital",
        wait_time: item.querySelector(".wait-time-value")?.innerText.trim() || "N/A",
      }));
    });

    // ✅ Send JSON response
    res.status(200).json({ success: true, data: hospitals });

  } catch (error) {
    console.error("Scraper Error:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
