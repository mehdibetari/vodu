
const configServer = require('./config-server').configServer;

function getMediaMetaData (mediaId, items, lastUpdateDate, baseUrl) {
    const media = items.filter(function (item) {
        return item.id == mediaId;
    });
    if (media[0] && media[0].premiereDate) {
        return {
            url: baseUrl + mediaId,
            title: `${media[0].name} - date de sortie: ${media[0].premiereDate}  sur Netflix`,
            description: (media[0].summary) ? `${media[0].name} - ${media[0].summary}` : '',
            calendarMaj: `Calendrier mis à jour le ${lastUpdateDate}`,
            image: media[0].localPath
        };
    }
    else if (media[0] && media[0].recurence) {
        return {
            url: baseUrl + mediaId,
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

exports.getMediaMetaData = getMediaMetaData;
