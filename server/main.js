if (Meteor.isServer) {

    function aggiungiOpportunità(opportunità){
        opportunità.aggiornamento = new Date();
        if (Opportunità.find({url: opportunità.url}).count() > 0) {
            Opportunità.remove({url: opportunità.url});
        }
        Opportunità.insert(opportunità);
    }

    function cancellaEventiPassati() {
        var count = Opportunità.remove({
            aggiornamento: { $lte: Tempo.ieri() }
        });
        console.log("eliminati %d eventi scaduti", count);
    }

    function crawlRomaltruista() {
        var res = HTTP.getWithEncoding("http://www.romaltruista.it/opportunita.asp" +
                                       "?data_dal=" + Tempo.aStringa(Tempo.oggi()) +
                                       "&data_al=" + Tempo.aStringa(Tempo.giorniNelFuturo(3)), {
                                          encoding: {from: "utf-8", to: "iso-8859-1"}
                                       });
        if (res.statusCode == 200) {
            var $ = cheerio.load(res.content);
            var opportunita = $('table[width="100%"]');

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

                    aggiungiOpportunità({
                        titolo: titolo.text().trim(),
                        area: area.html().substring(area.html().indexOf("Area:")+5).trim(),
                        zona: zona.text().trim(),
                        quando: quando.text().trim(),
                        orari: orari.text().trim(),
                        descrizione: descrizione.text().trim(),
                        fonte: "romaltruista",
                        url: "http://www.romaltruista.it/" +
                                linkDettaglio.substring(
                                    "javascript:apriPopUp('".length,
                                    linkDettaglio.indexOf('&wname')
                                )
                    });
                }
            });
            console.log("fine caricamento su db - %d opportunità nel db", Opportunità.find({}).count());
        }
    }

    SyncedCron.add({
      name: 'Crawling romaltruista',
      schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 2 hours');
      },
      job: function() {
          crawlRomaltruista();
          cancellaEventiPassati();
      }
    });

    Meteor.startup(function () {

        cancellaEventiPassati();

        if (Opportunità.find(timeFilter).count() == 0)
            crawlRomaltruista();

        SyncedCron.start();

//        Meteor.methods({
//            testMethod: function() {
//                return val;
//            }
//        });
    });
}
