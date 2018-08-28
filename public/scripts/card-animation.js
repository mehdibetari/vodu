$(document).ready(function () {
  //Card animation
  var zindex = 10;

  $("div.card").click(function (e) {

    e.preventDefault();

    if (e.target.className === 'btn share-btn') {
      return;
    }
    var isShowing = false;

    if ($(this).hasClass("show")) {
      isShowing = true
    }

    if ($("div.cards").hasClass("showing")) {
      // a card is already in view
      $("div.card.show")
        .removeClass("show");

      if (isShowing) {
        // this card was showing - reset the grid
        $("div.cards")
          .removeClass("showing");
      } else {
        // this card isn't showing - get in with it
        $(this)
          .css({
            zIndex: zindex
          })
          .addClass("show");

          displayShareLinks(this);


      }

      zindex++;

    } else {
      // no cards in view
      $("div.cards")
        .addClass("showing");
      $(this)
        .css({
          zIndex: zindex
        })
        .addClass("show");

        displayShareLinks(this);
      zindex++;
    }

  });
});

function displayShareLinks (that) {
  var uid = $(that).attr('id');

  if ($(that).find('.twitter-tweet-button').length > 0) {
    return;
  }
  
  /*twitter btn added with JS*/
  if (uid) {
    var name = $('#' + uid).find('.name').text();
    var premiereDate = $('#' + uid).find('.date-de-sortie').text();
  }
  twttr.widgets.createShareButton(
    "http:\/\/alloserie.fr\/calendrier\/netflix\/" + uid,
    document.getElementById("twitter-share-btn-" + uid),
    {
      text: name + ' - ' + premiereDate,
      hashtags: "netflix"
    }
  );

  /*facebook share btn added from template*/
  var templateId = 'share-template-' + uid;
  var template = document.querySelector('#'+templateId);
  var clone = document.importNode(template.content, true);
  $("#twitter-share-btn-" + uid).after(clone);
}