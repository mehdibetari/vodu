## STEPS

### 1 Fetch justwatch list and copy to FR-netflix-tv-shows.json
On postman : https://apis.justwatch.com/content/titles/fr_FR/popular?body=%7B%22age_certifications%22:null,%22content_types%22:%5B%22show%22%5D,%22genres%22:null,%22languages%22:null,%22max_price%22:null,%22min_price%22:null,%22monetization_types%22:%5B%22flatrate%22,%22rent%22,%22ads%22,%22buy%22,%22free%22%5D,%22page%22:1,%22page_size%22:10000,%22presentation_types%22:null,%22providers%22:%5B%22nfx%22%5D,%22release_year_from%22:null,%22release_year_until%22:null,%22scoring_filter_types%22:null,%22timeline_type%22:null%7D

### 2 run index.js

### 2.1 run globalRank.js

### 3 run match.js

### 4 run storePosters.js

### 5 run replaceUrl.js to copy fr posterUrls to each file lang if store poster failed for all sauf fr
