const fetch = require("node-fetch");
const cheerio = require("cheerio");

const ALLOCINE_SERIES_BASE_URL = "http://www.allocine.fr/series-tv/decennie-2010/";

const getSeriePage = async pageNum => {
    let compteur = 0;
    const items = [];
    const pageParam =
        pageNum && Number.isInteger(pageNum) ? `?page=${pageNum}` : "";
    const url = `${ALLOCINE_SERIES_BASE_URL}${pageParam}`;
    console.log(`[PAGE ${pageNum}] Try fetch : ${url}`);
    const response = await getData(url);
    if (!response) return [];
    const body = await response.text();
    console.log(`[PAGE ${pageNum}] Succefully fetched ☻☻☻☻☻☻☻`);
    const $ = cheerio.load(body);
    await $("li.hred", "ul").map(function() {
        if (
        $(this)
            .find(".button-netflix-full")
            .html()
        ) {
        compteur++;
        const ranking = $(this).find(".stareval-note", ".stareval");
        items.push({
            title: $(this)
            .find("a.meta-title-link", "h2")
            .text(),
            ranking: {
            presse:
                ranking.length > 1
                ? parseFloat(
                    ranking
                        .first()
                        .text()
                        .trim()
                        .replace(",", ".")
                    )
                : null,
            spectateur:
                ranking.length > 1
                ? parseFloat(
                    ranking
                        .last()
                        .text()
                        .trim()
                        .replace(",", ".")
                    )
                : null,
            popularite: `${pageNum}${compteur}`
            }
        });
        }
    });
    console.log(`   --- ${items.length} series founded on page ${pageNum}`);
    await timeout(1000);
    return items;
};

const getData = async url => {
  try {
    return await fetch(url)
  } catch (error) {
    console.log(error);
    return false;
  }
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.getSeriePage = getSeriePage;
