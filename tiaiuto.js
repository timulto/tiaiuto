if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.listaProgetti.helpers({
    counter: function () {
      return Session.get('counter');
    },
    progetti: function () {
      return Session.get('progetti');
    }
  });

  Template.listaProgetti.events({
    'click button': function () {
        console.log("eccomi");
        Meteor.call("getProgetti", function(err, res){
            if (!err) {
                Session.set("progetti", res);
            }
        })
      }
   });
}

if (Meteor.isClient) {
    Meteor.startup(function () {
        Meteor.call("getProgetti", function(err, res){
            if (!err) {
                Session.set("progetti", res);
            }
        });

        $('.button-collapse').sideNav();
        $('.parallax').parallax();
    });
}




if (Meteor.isServer) {
    var progettiArray;

    function getProgetti() {
        // meteor add http aldeed:http
        // https://github.com/aldeed/meteor-http-extras/
        // to fix encoding issues
        var res = HTTP.getWithEncoding("http://www.romaltruista.it/calendario.asp", {encoding: {from: "iso-8859-1", to: "iso-8859-1"}});
        // http://www.romaltruista.it/opportunita.asp
        if (res.statusCode == 200) {
            var $ = cheerio.load(res.content);
            var progettiaperti = $('.attivita.progettoaperto');
            var progetti = new Array();

            console.log("scaricati progetti aperti %d", progettiaperti.length);
            progettiaperti.each(function (i, elem) {
                //console.log($(this).find('.titolo').text());
                progetti.push({
                    titolo: $(this).find('.titolo').text(),
                    orari: $(this).find('.orari').text(),
                });
            });
            return progetti;
        } else {
            return null;
        }
    }

    function getOpportunita() {
        var res = HTTP.getWithEncoding("http://www.romaltruista.it/opportunita.asp", {encoding: {from: "utf-8", to: "iso-8859-1"}});
        if (res.statusCode == 200) {
            var $ = cheerio.load(res.content);
            var opportunita = $('table[width="100%"]');
            var opportunitaArr = new Array();

            console.log("scaricate opportunità %d", opportunita.length);
            opportunita.each(function (i, elem) {
                if (i > 1) {
                    var area = $(this.find('td[width="77%"]')[0]);
                    var zona = $(this.find('td[width="77%"]')[1]);
                    var quando = $(this.find('td[width="23%"]')[0]);
                    var orari = $(this.find('td[width="23%"]')[1]);
                    var titolo = $(area.find('span[style="font-weight: bold; font-size: 1em;"]'));
                    var descrizione = $(this.find('td[rowspan="2"]'));

                    opportunitaArr.push({
                        titolo: titolo.text().trim(),
                        area: area.html().substring(area.html().indexOf("Area:")+5).trim(),
                        zona: zona.text().trim(),
                        quando: quando.text().trim(),
                        orari: orari.text().trim(),
                        descrizione: descrizione.text().trim()
                    });
                }
            });
            return opportunitaArr;
        } else {
            return null;
        }
    }

    SyncedCron.add({
      name: 'Crawling progetti',
      schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 10 minutes');
      },
      job: function() {
          opps = getOpportunita();
      }
    });

    Meteor.startup(function () {
        opps = getOpportunita();

        SyncedCron.start();

        Meteor.methods({
            getProgetti: function() {
                return opps;
            }
        });
    });
}
