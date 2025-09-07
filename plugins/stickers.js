

const axios = require("axios");
const cheerio = require("cheerio");

const stickers = {
 getCategory: async () => {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const categories = [];

    $("a[href^='/id/telegram/catalog/']").each((_, el) => {
      const href = $(el).attr("href");
      const match = href.match(/\/catalog\/([^/]+)\//);
      if (match) categories.push(match[1]);
    });

    return categories;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  }
 },
 searchByQuery: async (query) => {
  const url = "https://stickers.wiki/_actions/searchTags/";
  try {
    const { data } = await axios.post(url, { query }, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        Origin: "https://stickers.wiki",
        Referer: "https://stickers.wiki/id/telegram/search/",
      },
    });
    
    if (!Array.isArray(data) || data.length < 3) return [];
    
    const links = [];
    const slugs = new Set();
    const indices = data[0];
    if (!Array.isArray(indices)) return [];
    
    indices.forEach(idx => {
      if (idx < data.length) {
        const item = data[idx];
        if (typeof item === "object" && item !== null && !Array.isArray(item) && 
            's' in item && 'n' in item && 'f' in item && 'c' in item && 'r' in item && 'l' in item) {
          const slugIndex = idx + 1;
          if (slugIndex < data.length && typeof data[slugIndex] === "string") {
            const slug = data[slugIndex];
            if (/^[a-zA-Z][a-zA-Z0-9_\-]{2,}$/.test(slug) && 
                !["webp", "webm", "tgs", "en", "id", "ja", "es", "pt", "hi", "ur", "ru", "ms", "zh", 
                  "English", "Unknown", "Japanese", "Portuguese", "Spanish", "russian", "english", 
                  "unknown", "mixed"].includes(slug)) {
              slugs.add(slug);
            }
          }
        }
      }
    });
    slugs.forEach(slug => {
      links.push(`https://stickers.wiki/id/telegram/${slug}/`);
    });
    
    return links;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  }
 },
 searchByCatalog: async (category) => {
  try {
    const { data } = await axios.get(`https://stickers.wiki/id/telegram/catalog/${category}/`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);

    const catalog = [];

    $("a[href^='/id/telegram/']").each((i, el) => {
      const link = "https://stickers.wiki" + $(el).attr("href");
      const title = $(el).find("h3").text().trim();

      if (title && link) {
        catalog.push({ title, link });
      }
    });

    return catalog;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  }
 },
 download: async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(data);
    const title = $("h1.line-clamp-2.w-full.text-center.text-2xl.font-semibold").text().trim();
    const sticker = [];
    $("div[onclick*='sticker-dialog'] script[type='application/ld+json']").each((i, el) => {
      try {
        const jsonData = JSON.parse($(el).html());
        if (jsonData.contentUrl) sticker.push(jsonData.contentUrl);
      } catch (err) {}
    });

    return { title, sticker };

  } catch (err) {
    console.error("Error:", err.message);
    return null;
  }
 }
}

module.exports = { stickers };