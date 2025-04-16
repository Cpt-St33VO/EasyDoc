const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 8080;

app.use(cors());

app.get('/api/inmyarea', async (req, res) => {
  const zip = req.query.zip;
  if (!zip) return res.status(400).json({ error: 'ZIP code required' });

  const url = `https://www.inmyarea.com/internet/${zip}/providers`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    const providers = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.provider-card');

      cards.forEach(card => {
        const name = card.querySelector('.provider-title, .provider__name, h3')?.innerText.trim() || '';
        const price = card.querySelector('.price, .provider-price')?.innerText.trim() || '';
        const speed = card.querySelector('.speed, .provider-speed')?.innerText.trim() || '';
        const type = card.querySelector('.connection-type')?.innerText.trim() || '';
        const contract = card.innerText.toLowerCase().includes('no contract') ? 'No contract' : 'May require contract';
        const dataCap = card.innerText.toLowerCase().includes('data cap') ? 'Has data cap' : 'Unlimited or unknown';

        if (name) {
          results.push({ name, price, speed, type, contract, dataCap });
        }
      });

      return results;
    });

    await browser.close();
    res.json({ providers });
  } catch (err) {
    console.error("Scrape error:", err.message);
    res.status(500).json({ error: 'Failed to retrieve provider details' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced ISP Scraper running at http://localhost:${PORT}`);
});
