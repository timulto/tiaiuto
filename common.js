Opportunità = new Mongo.Collection("opportunità");

Tempo = {
    ieri: function() {
        return new Date( Date.now() - 24*60*60*1000 );
    },
    oggi: function() {
        return new Date();
    },
    domani: function() {
        return new Date( Date.now() + 24*60*60*1000 );
    },
    dopoDomani: function() {
        return new Date( Date.now() + 48*60*60*1000 );
    },
    giorniNelFuturo: function(giorni) {
        return new Date( Date.now() + (giorni*24)*60*60*1000 );
    },
    unOraFa: function() {
        return new Date( Date.now() - 60*60*1000 );
    },
    formatta: function(data) {
        return moment(data).format('DD/MM/YYYY HH:mm');
    },
    aStringa: function(data) {
        return moment(data).format('DD/MM/YYYY');
    }
}

timeFilter = {
    aggiornamento: { $gte: Tempo.ieri() }
}
