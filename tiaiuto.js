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
                    var linkDettaglio = $(this.find('img[style="cursor: pointer"]')).attr('onclick');

                    /*
                    <td align="right" style="font-size: 1em;">
                        <img style="cursor: pointer" onclick="javascript:apriPopUp('opportunita_dettaglio.asp?idprogetto=13306&amp;wname='+window.name,'Dettaglio Progetto');" src="sites/default/themes/honbiro/opp_desc.jpg">
                    </td>
                    */

                    opportunitaArr.push({
                        titolo: titolo.text().trim(),
                        area: area.html().substring(area.html().indexOf("Area:")+5).trim(),
                        zona: zona.text().trim(),
                        quando: quando.text().trim(),
                        orari: orari.text().trim(),
                        descrizione: descrizione.text().trim(),
                        linkDettaglio: "http://www.romaltruista.it/" +
                                        linkDettaglio.substring(
                                            "javascript:apriPopUp('".length,
                                            linkDettaglio.indexOf('&wname')
                                        )
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
        return parser.text('every 2 hours');
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
