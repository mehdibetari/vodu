'use strict';

class Media {

    constructor(media) {
        setOriginalId(media.id || null);
        setName(media.name || null);
        setType(media.type || null);
        setPremiereDate(media.premiereDate || null);
        setSeasons(media.seasons || null);
        setOriginalUrl(media.uri || null);
        setActors(media.actors || null);
        setDirectors(media.directors || null);
        setCreators(media.creators || null);
        setPosterUrl(media.posterUrl || null);
        setSummary(media.summary || null);
        setImdbPath(media.mediaLink || null);
        setImdbId(media.mediaLink || null);
    }
    
    setOriginalId(oid) {
        this.originalId = oid;
    }
    
    setName(name) {
        this.name = name;
    }
    
    setType(type) {
        this.type = type;
    }
    
    setPremiereDate(premiereDate) {
        this.premiereDate = premiereDate;
    }
    
    setSeasons(seasons) {
        this.seasons = seasons;
    }
    
    setOriginalUrl(ourl) {
        this.ourl = ourl;
    }
    
    setActors(actors) {
        this.actors = actors;
    }
    
    setDirectors(directors) {
        this.directors = directors;
    }
    
    setCreators(creators) {
        this.creators = creators;
    }
    
    setPosterUrl(posterUrl) {
        this.posterUrl = posterUrl;
    }
    
    setSummary(summary) {
        this.summary = summary;
    }
    
    setImdbPath(imdbPath) {
        this.imdbPath = imdbPath;
    }
    
    setImdbId(imdbPath) {
        const explodedPath = imdbPath.split('/');
        this.imdbPath = explodedPath[2] || null;
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

"id": 4846,
"categoryId": "titles",
"category": "Only On Netflix",
"name": "Club De Cuervos",
"description": "",
"runTime": "",
"type": "series",
"distribution": "global",
"distributionComments": "",
"specialFormats": "",
"premiereDate": "29 septembre 2017",
"seasons": 2,
"uri": "/fr/only-on-netflix/4846",
"locale": "fr",
"sortDate": "2017-09-29",
"actors": "Luis Gerardo Méndez, Mariana Treviño, Stephanie Cayo...",
"directors": "",
"creators": "Gary Alazraki, Michael Lam...",
"posterUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTk1NDQ3NzY1Ml5BMl5BanBnXkFtZTgwMzM4ODc0MzI@._V1_UY268_CR1,0,182,268_AL_.jpg",
"mediaLink": "/title/tt4680240/?ref_=fn_al_tt_1",
"summary": "\n                    When the patriarch of a prominent family dies, his heirs battle to determine who will gain control of his beloved soccer team: The Cuervos of Nuevo Toledo.\n            ",
"localPath": "https://ucarecdn.com/080267c0-08c7-4368-9510-653491e07033/MV5BMTk1NDQ3NzY1Ml5BMl5BanBnXkFtZTgwMzM4ODc0MzI_V1_UY268_CR10182268_AL_.jpg",
"uuid": "9ca8db10-aecd-11e7-8a70-fd15344748aa"