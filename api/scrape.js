import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

export default async function handler(req, res) {
  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://howlongwilliwait.com/", { waitUntil: "networkidle2" });
    await page.waitForSelector(".hospital-list .hospital-item", { timeout: 10000 });

    const hospitals = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".hospital-list .hospital-item"));
      return items.map(item => ({
        name: item.querySelector(".hospital-name")?.innerText.trim() || "Unknown Hospital",
        wait_time: item.querySelector(".wait-time-value")?.innerText.trim() || "N/A",
      }));
    });

    await browser.close();
    res.status(200).json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
