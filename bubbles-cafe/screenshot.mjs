import puppeteer from "puppeteer";

async function captureScreenshot() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3001/reader", { waitUntil: "networkidle0" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "./reader-screenshot.png" });
  await browser.close();
  console.log("Screenshot captured successfully!");
}

captureScreenshot().catch(console.error);
