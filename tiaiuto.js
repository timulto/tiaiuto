if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        var res = HTTP.get("http://www.romaltruista.it/calendario.asp");
        var progetti = new Array();
        if (res.statusCode == 200) {
            var $ = cheerio.load(res.content);
            var progettiaperti = $('.attivita.progettoaperto');
            console.log("progetti aperti %d", progettiaperti.length);
            progettiaperti.each(function (i, elem) {
                console.log($(this).find('.titolo').text());
                progetti.push({ titolo: $(this).find('.titolo').text() });
            });
            console.log(JSON.stringify(progetti));
        }
    });
}
