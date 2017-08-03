var tunnel = require('tunnel-ssh');

var config = {
      username:'root',
      Password:'mfd041990!',
      host:'139.59.154.200',
      port:22,
      dstHost:'139.59.154.200',
      dstPort:27017,
      localHost:'127.0.0.1',
      localPort: 27000
    };

    tunnel(config, function (error, server) {
        console.log("Hello");
    MongoClient.connect('mongodb://enfesco:mfd041990!@139.59.154.200:27017/admin', (err, database) => {
      if (err) return console.log(err)
        db = database
        db.collection('enfesco').createIndex({"searchText": "text"})
        app.listen(process.env.PORT || 5000, () => {
          console.log('listening on 5000')
        })
    })
  });