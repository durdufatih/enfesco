const express = require('express');
const bodyParser= require('body-parser')
const app = express();
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
var pagination = require('pagination');
var YouTube = require('youtube-node');

var youTube = new YouTube();

var db;
const MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
youTube.setKey('AIzaSyBNq9B6345OOESbftbydnyV17QdX3HrSAk');

MongoClient.connect('mongodb://45.32.159.243:27017/enfesco', (err, database) => {
   if (err) return console.log(err)
	  db = database
    db.collection('enfesco').createIndex({"searchText": "text"})
	  app.listen(process.env.PORT || 5000, () => {
	    console.log('listening on 5000')
	  })
})



app.get('/youtube', (req, res) => {
  youTube.search('Patlıcan ', 1, function(error, result) {
  if (error) {
    console.log(error);
  }
  else {
    res.end(JSON.stringify(result, null, 1));
  }
  });
})
app.get('/', (req, res) => {
  db.collection('items').find().toArray((err, result) => {
      if (err) return console.log(err)
       res.render('pages/search.ejs', {items: result})
    })
})

app.get('/api/items', (req, res) => {
  db.collection('items').find().toArray((err, result) => {
      var json = JSON.stringify({items:result});
      res.end(json);
    })
})

app.post('/api/find', (req, res) => {
  db.collection('enfesco').find({ "id" : req.body.id}).toArray((err, result) => {
      if (err) return console.log(err)
      var json = JSON.stringify({item:result});
       res.end(json);
    })
})

app.post('/api/foods', (req, res) => {
  var searchText="";
  if(!Array.isArray(req.body.items)){
    searchText = req.body.items;
  }
  else
  {
  for (var i = 0, len = req.body.items.length; i < len; i++) {
     if(i !=0)
       searchText=searchText+" "+req.body.items[i]+" ";
     else if(i!=req.body.items.length)
       searchText=searchText+" "+req.body.items[i];
     else
        searchText=searchText+" "+req.body.items[i];
   }

  }
  db.collection('enfesco').find({ $text: { $search : searchText}}, {score: {'$meta': "textScore"}}).sort({score:{'$meta': "textScore"}})
  .skip(parseInt(req.body.page)*parseInt(req.body.count)).limit(parseInt(req.body.count)).toArray((err, result) => {
      if (err) return console.log(err)
      res.json({foods:result});
  })

})

app.get('/contact', (req, res) => {
    res.render('pages/contact.ejs')
})

app.get('/about', (req, res) => {
    res.render('pages/about.ejs');
})

app.get('/data', (req, res) => {
  console.log("Gello");
  db.collection('enfesco').find().toArray((err, result) => {
    console.log(result.length);
      for (var i = 0; i <result.length; i++) {
        /*var searchText="";
        for (var j = 0; j < result[i].ingredients.length; j++) {
           searchText=searchText+result[i].ingredients[j].name+" ";

        }
        console.log(searchText);*/
        console.log(result[i]._id)
         db.collection('enfesco').update({"_id" :new ObjectId(result[i]._id) },{$set : {"id":new ObjectId(result[i]._id).toString()}})
         console.log(db.collection('enfesco').find({"_id" :result[i]._id }).id);
         /*youTube.search(result[i].name, 1, function(error, food) {
           if (error) {
             console.log(error);
           }
           else {
             console.log(food.items[0].thumbnails)
             console.log(food.items[0]);
             db.collection('enfesco').update({"_id" :result[i]._id },{$set : {"imageDefault":food.items[0].thumbnails.default.url,"imageMedium":food.items[0].thumbnails.medium.url,"imageHigh":food.items[0].thumbnails.high.url}})

           }
         });*/
      }

    })
})


app.get('/find/:id', (req, res) => {
  console.log(new ObjectId(req.params.id));
  db.collection('enfesco').find({ "id" : req.params.id}).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result);
       res.render('pages/food.ejs', {food: result});
    })
})

app.post('/item/search', (req, res) => {
  console.log(req.body.q.term);
 db.collection('items').find().toArray((err, result) => {
      if (err) return console.log(err)
        res.send(JSON.stringify(result));

    })
})
app.post('/',(req,res)=>{
  var searchText="";
  if(!Array.isArray(req.body.items)){
    searchText = req.body.items;
  }
  else
  {
  for (var i = 0, len = req.body.items.length; i < len; i++) {
     if(i !=0)
       searchText=searchText+" "+req.body.items[i]+" ";
     else if(i!=req.body.items.length)
       searchText=searchText+" "+req.body.items[i];
     else
        searchText=searchText+" "+req.body.items[i];

        console.log(searchText);
   }
   //searchText="\""+searchText+"\"";
   console.log(searchText);
  }
  db.collection('enfesco').find({ $text: { $search : searchText}}, {score: {'$meta': "textScore"}}).sort({score:{'$meta': "textScore"}})
  .toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result);
      res.render('pages/foods.ejs', {foods: result,searchItems:req.body.items});
  })

})
