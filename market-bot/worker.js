const axios = require('axios');

// Configuration via env
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const ITEMS = (process.env.ITEMS || 'T4_SWORD,T4_HELMET').split(',').map(s=>s.trim());
const LOCATIONS = (process.env.LOCATIONS || 'Caerleon,BlackMarket').split(',').map(s=>s.trim());
const INTERVAL = Number(process.env.INTERVAL || 5) * 1000; // ms
// flip detection config
const FEE_PERCENT = Number(process.env.FEE_PERCENT || 5); // marketplace fee % approx
const MIN_PROFIT = Number(process.env.MIN_PROFIT || 50); // minimum gold profit to report

// Simple helper to fetch prices for a single item
async function fetchPricesForItem(itemId) {
  try {
    // albion-online-data API (v2) prices endpoint
    const locs = LOCATIONS.join(',');
    const url = `https://www.albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(itemId)}?locations=${encodeURIComponent(locs)}`;
    const res = await axios.get(url, { timeout: 10000 });
    return res.data; // array of {city, sell_price_min, buy_price_max, ...}
  } catch (err) {
    console.error('fetchPricesForItem error', itemId, err.message);
    return null;
  }
}

async function publishToServer(itemId, prices) {
  try {
    // allow optional opportunity as 3rd arg
    const body = { itemId, region: LOCATIONS, prices };
    if (arguments[2]) body.opportunity = arguments[2];
    await axios.post(`${SERVER_URL}/publish`, body);
  } catch (err) {
    console.error('publishToServer error', err.message);
  }
}

async function pollLoop() {
  console.log('Starting worker: polling items', ITEMS, 'locations', LOCATIONS, 'interval', INTERVAL);

  while (true) {
    for (const item of ITEMS) {
      const data = await fetchPricesForItem(item);
      if (!data) continue;

      // transform data into map { city: { sell, buy } }
      const prices = {};
      for (const row of data) {
        const city = row.city || row.location || 'unknown';
        prices[city] = {
          sell: row.sell_price_min || null,
          buy: row.buy_price_max || null,
          quality: row.quality || null,
        };
      }

      // publish price snapshot
      console.log('Publishing', item, prices);
      await publishToServer(item, prices);

      // flip detection between two locations (simple pairwise check)
      try {
        const [a, b] = LOCATIONS;
        if (a && b && prices[a] && prices[b]) {
          const buyA = prices[a].buy || null; // what buyers pay in A
          const sellA = prices[a].sell || null; // what sellers ask in A
          const buyB = prices[b].buy || null;
          const sellB = prices[b].sell || null;

          // consider buying from the city with lower sell price and selling to the city with higher buy price
          const candidates = [];
          if (sellA && buyB) candidates.push({ from: a, to: b, buyPrice: sellA, sellPrice: buyB });
          if (sellB && buyA) candidates.push({ from: b, to: a, buyPrice: sellB, sellPrice: buyA });

          for (const c of candidates) {
            // compute estimated profit after fee
            const gross = c.sellPrice - c.buyPrice;
            const fees = (c.sellPrice * (FEE_PERCENT/100));
            const profit = gross - fees;
            if (profit >= MIN_PROFIT) {
              const opportunity = {
                itemId: item,
                from: c.from,
                to: c.to,
                buyPrice: c.buyPrice,
                sellPrice: c.sellPrice,
                profit: Math.round(profit),
                ts: Date.now()
              };
              console.log('Found opportunity', opportunity);
              // publish opportunity along with prices
              await publishToServer(item, prices, opportunity);
            }
          }
        }
      } catch (err) {
        console.error('Flip detection error', err.message);
      }
      // small delay between items
      await new Promise((r) => setTimeout(r, 300));
    }

    await new Promise((r) => setTimeout(r, INTERVAL));
  }
}

pollLoop().catch((e) => console.error('Worker loop failed', e));
