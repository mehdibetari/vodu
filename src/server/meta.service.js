const configServer = require('./config-server').configServer;

class StructuredData {
    constructor(items, baseUrl, now) {
        let media;
        const art = new Article(now);
        this.data = {
            '@context': 'https://schema.org',
            itemList: {
                '@type': 'ItemList',
                itemListElement: items.map((item, index) => { 
                    media = new Item(item, index, baseUrl);
                    return media.item;
                })
            },
            article: art.article
        };
    }

    get items() {
        return this.data;
    } 
}

class Item {
    constructor(item, index, baseUrl) {
        let people;
        this.data = {};
        this.data["@type"] = "ListItem";
        this.data.position = index + 1;

        const Director = item.directors ? new Person(item.directors.replace('...', '').split(',')[0]) : undefined;
        const Authors = item.creators ? item.creators.replace('...', '').split(',').map((creator) => { 
            people = new Person(creator);
            return people.person;
        }) : undefined;
        const Actors = item.actors ? item.actors.replace('...', '').split(',').map((actor) => {
            people = new Person(actor);
            return people.person;
        }) : undefined;

        this.data.item = {
            "@type": item.series? "TVSeries" : "Movie", // text "Movie" ou "TVSeries"
            "url": `${baseUrl}#${encodeURI(item.name)}`, // text url => baseUrl + item.id
            "name": item.name, // text => item.name
            "actor": Actors, // persons => split item.actors
            "author": Authors, // persons => split item.creators
            "director": Director && Director.person || 'non renseigné', // person => split item.directors
            "datePublished": item.sortDate, // "2009-05-08" => item.sortDate
            "description": item.description, // text => item.description
            "image": item.posterUrl // text url => item.posterUrl
        };
    }

    get item() {
        return this.data;
    } 
}

class Person {
    constructor(name) {
        this.data = {};
        this.data["@type"] = "Person";
        this.data.name = name;
    }

    get person() {
        return this.data;
    }
}

class Article {
    constructor(now) {
        this.data = {};
        this.data["@type"] = "Article";
        this.data.headline = `Calendrier ${now.getFullYear()} des sorties NETFLIX FRANCE`;
        this.data.alternativeHeadline = `Agenda ${now.getFullYear()} films et series ORIGINAL NETFLIX`;
        this.data.image = "https://www.medial.mk/wp-content/uploads/2018/07/54c06cc456b374f4da3266f193200425.jpeg";
        this.data.author = "Arsene B.";
        this.data.url = "http://alloserie.fr/calendrier/netflix";
        this.data.datePublished = "2017-10-09";
        this.data.dateModified = `${now.getFullYear()}-${(now.getMonth()+1)}-${now.getDate()}`;
        this.data.mainEntityOfPage = "Article";
        this.data.publisher = {
            '@type': 'Organization',
            name: 'Alloserie',
            logo: 'http://www.alloserie.fr/images/alloserie@2x.png'
        };
    }

    get article() {
        return this.data;
    }
}

function getMediaMetaData (mediaId, items, lastUpdateDate, baseUrl) {
    const media = items.filter(function (item) {
        return item.id == mediaId;
    });
    if (media[0] && media[0].premiereDate) {
        return {
            url: `${baseUrl}/${mediaId}`,
            title: `${media[0].name} - date de sortie: ${media[0].premiereDate}  sur Netflix`,
            description: (media[0].summary) ? `${media[0].name} - ${media[0].summary}` : '',
            calendarMaj: `Calendrier mis à jour le ${lastUpdateDate}`,
            image: media[0].localPath
        };
    }
    else if (media[0] && media[0].recurence) {
        return {
            url: `${baseUrl}/${mediaId}`,
            title: `${media[0].name} ${media[0].recurence} sur Netflix`,
            description: (media[0].summary) ? `${media[0].name} - ${media[0].summary}` : '',
            calendarMaj: `Calendrier mis à jour le ${lastUpdateDate}`,
            image: media[0].localPath
        };
    }
    else {
        const weekly = baseUrl === configServer.ALLOSERIE_NETFLIX_WEEKLY_URL;
        const title = weekly ? configServer.ALLOSERIE_NETFLIX_WEEKLY_TITLE : configServer.ALLOSERIE_NETFLIX_CALENDAR_TITLE;
        const description = weekly ? configServer.ALLOSERIE_NETFLIX_WEEKLY_DESCRIPTION : configServer.ALLOSERIE_NETFLIX_CALENDAR_DESCRIPTION;
        return {
            url: baseUrl,
            title,
            description,
            calendarMaj: `Calendrier mis à jour le ${lastUpdateDate}`,
            image: 'https://ucarecdn.com/342ba0b7-5883-408c-8b19-de42c55a6fa7/alloserielogo2x.jpg'
        };
    }
}

function getStructuredData(items, now) {
    const list = new StructuredData(items, configServer.ALLOSERIE_NETFLIX_CALENDAR_URL, now);
    return list.items;
}

module.exports = { getMediaMetaData, getStructuredData };
