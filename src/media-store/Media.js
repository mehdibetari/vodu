'use strict';
const NETFLIX_BASE_URL = 'https://media.netflix.com';
const IMDB_BASE_URL = 'http://www.imdb.com';

class Media {
    
    constructor(media, from) {
        this.setIdentifier();
        this.setCategory();
        this.setLink();
        this.setPoster();
        this.setName(media.name);
        this.setType(media.type);
        this.setPremiereDate(media.premiereDate);
        this.setSeasons(media.seasons);
        this.setSortDate(media.sortDate);
        this.setActors(media.actors);
        this.setDirectors(media.directors);
        this.setCreators(media.creators);
        this.setSummary(media.summary);
        this.setYear(media.sortDate);
        this.setSlug(this.name, this.year, this.type);
        if (media.id && from) {
            this.addIdentifier(media.id,from);
        }
        if (media.category && from) {
            this.addCategory(media.category,from);
        }
        if (media.uri && from && from === 'netflix-upcomings') {
            this.addLink(NETFLIX_BASE_URL + media.uri,from);
        }
        if (media.mediaLink && from) {
            this.addLink(IMDB_BASE_URL + media.mediaLink, 'IMDB');
        }
        if (media.posterUrl) {
            this.addPoster(media.posterUrl, from);
        }
        if (media.localPath) {
            this.addPoster(media.localPath, 'own-cloud-storage');
        }

    }
    setIdentifier() {
        this.indentifier = [];
    }
    setCategory() {
        this.category = [];
    }
    setLink() {
        this.link = [];
    }
    setPoster() {
        this.poster = [];
    }
    setName(name) {
        this.name = name || '';
    }
    setType(type) {
        this.type = type || '';
    }
    setPremiereDate(premiereDate) {
        this.premiereDate = premiereDate || '';
    }
    setSeasons(seasons) {
        this.seasons = seasons || '';
    }
    setSortDate(sortDate) {
        this.sortDate = sortDate || '';
    }
    setActors(actors) {
        this.actors = actors || '';
    }
    setDirectors(directors) {
        this.directors = directors || '';
    }
    setCreators(creators) {
        this.creators = creators || '';
    }
    setSummary(summary) {
        this.summary = summary || '';
    }
    setYear(sortDate) {
        this.year = sortDate.split('-')[0];
    }
    setSlug(name,year,type) {
        const cleanName = name.toLowerCase().replace(/\s/g,'');
        this.slug = cleanName + '<|>' + year + '<|>' + type.toLowerCase()[0];
    }
    addIdentifier(id, from) {
        this.indentifier.push({'from': from, 'value': id});
    }
    addCategory(category, from) {
        this.category.push({'from': from, 'value': category});
    }
    addLink(link, from) {
        this.link.push({'from': from, 'value': link});
    }
    addPoster(url, from) {
        this.poster.push({'from': from, 'value': url});
    }

    get(attributeName) {
        if(attributeName) {
            return this[attributeName];
        }
        else {
            return this;
        }
    }

}
module.exports =  Media;
