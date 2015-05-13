if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    progetti: function () {
      return Session.get('progetti');
    }
  });

  Template.hello.events({
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
        })
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        //noop
        Meteor.methods({
            getProgetti: function(){
                // meteor add http aldeed:http
                // https://github.com/aldeed/meteor-http-extras/
                // to fix encoding issues
                var res = HTTP.get("http://www.romaltruista.it/calendario.asp");
                // http://www.romaltruista.it/opportunita.asp
                if (res.statusCode == 200) {
                    var $ = cheerio.load(res.content);
                    var progettiaperti = $('.attivita.progettoaperto');
                    var progetti = new Array();

                    console.log("progetti aperti %d", progettiaperti.length);
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
        });
    });
}
