const fetch = require("node-fetch");
const justWatchApi_BASE_URL = 'https://apis.justwatch.com/content/titles/';
const justWatchApi_show = `${justWatchApi_BASE_URL}show/`;
const justWatchApi_shows_list = `${justWatchApi_BASE_URL}fr_FR/popular?body=%7B%22age_certifications%22:null,%22content_types%22:%5B%22show%22%5D,%22genres%22:null,%22languages%22:null,%22max_price%22:null,%22min_price%22:null,%22monetization_types%22:%5B%22flatrate%22,%22rent%22,%22ads%22,%22buy%22,%22free%22%5D,%22page%22:1,%22page_size%22:10000,%22presentation_types%22:null,%22providers%22:%5B%22nfx%22%5D,%22release_year_from%22:null,%22release_year_until%22:null,%22scoring_filter_types%22:null,%22timeline_type%22:null%7D`;
const langsMapping = {de: 'de_DE', fr: 'fr_FR', es: 'es_ES', pt: 'pt_PT', en: 'en_US'};

const getSeriePage = async (pageNum, lang = 'fr') => {
    const locale = `/locale/${langsMapping[lang]}` ;
    const url = `${justWatchApi_show}${pageNum}${locale}`;
    console.log(`[PAGE ${pageNum}] Try fetch : ${url}`);
    const response = await getData(url);
    if (!response) return [];
    const data = await response.json();
    console.log(`[PAGE ${pageNum}] Succefully fetched ☻☻☻☻☻☻☻`);
    await timeout(1000);
    return data;
};

const getSeriesList = async () => {
  const response = await getData(justWatchApi_shows_list);
  if (!response) return {};
  const data = await response.json();
  console.log(`[JUSTWATCH NETFLIX SHOWS PAGE] Succefully fetched ☻☻☻☻☻☻☻`);
  return data;
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
module.exports.getSeriesList = getSeriesList;
