import puppeteer from "puppeteer";

async function captureScreenshot() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3001/", { waitUntil: "networkidle0" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "./homepage-screenshot.png" });
  console.log("Screenshot captured successfully!");
  await browser.close();
}

captureScreenshot().catch(console.error);
