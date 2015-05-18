if (Meteor.isClient) {

    Template.registerHelper('nospaces', function(str) {
      return str.split(' ').join('-').split('\'').join('');
    });

    Template.registerHelper('formatta', function(data) {
      return Tempo.formatta(data);
    });

    Template.registerHelper('aree', function(data) {
      return Session.get("aree");
    });

    Template.listaOpportunità.helpers({
        listaOpportunità: function () {
            // pagination
            // meteor add alethes:pages
            // https://atmospherejs.com/alethes/pages
            var filter = {
                aggiornamento: timeFilter.aggiornamento
            };

            if (Session.get("area") && Session.get("area") != 'tutte') {
                filter.area = Session.get("area");
            } else {
                delete filter.area;
            }

            var res = Opportunità.find(filter, { limit: 5 });
            return res;
        }
    });

    Template.body.events({
        'click #iscriviti-button': function (evt) {
            evt.preventDefault();
            $('#iscriviti').hide();
//            $('#background').attr('src', 'images/partecipazione6.jpg');
            $('#index-banner').css('min-height', '150px');
        }
    });

    Template.listaOpportunità.events({
        'click .area': function (evt) {
            evt.preventDefault();
            var thisBtn = $(evt.target)
            Session.set("area", thisBtn.attr("data"));
            $('.area').each(function( index ) {
                $(this).css("color", "white");
            });
            thisBtn.css("color", "teal");
        }
    });

    Template.listaAree.events({
        'click .area': function (evt) {
//            evt.preventDefault();
            var thisBtn = $(evt.target)
            Session.set("area", thisBtn.attr("data"));
            $('.area').each(function( index ) {
                $(this).css("font-weight", "normal");
            });
            thisBtn.css("font-weight", "bold");
        }
    });

    Meteor.startup(function () {
        $(document).ready(function(){
            $('.button-collapse').sideNav();
            $('.parallax').parallax();
            //$('select').material_select();
        });
        Opportunità.distinct("area", function(err, res){
            if (err) {
                console.error("error: %s", err.message);
            } else {
                var aree = new Array();
                _.each(res, function(elem){
                    console.log(JSON.stringify(elem));
                    aree.push({ nome: elem });
                });
                Session.set("aree", aree);
            }
        });
    });
}
