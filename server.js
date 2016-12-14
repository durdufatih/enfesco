const express = require('express');
const bodyParser= require('body-parser')
const app = express();
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
var pagination = require('pagination');



var db;
const MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;

MongoClient.connect('mongodb://45.32.159.243:27017/enfesco', (err, database) => {
   if (err) return console.log(err)
	  db = database
    db.collection('enfesco').createIndex({"searchText": "text"})
	  app.listen(process.env.PORT || 5000, () => {
	    console.log('listening on 5000')
	  })
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
  console.log(req.body.id);
  db.collection('enfesco').find({ "_id" : req.body.id}).toArray((err, result) => {
      if (err) return console.log(err)
      var json = JSON.stringify({item:result});
       res.end(json);
    })
})

app.post('/api/foods', (req, res) => {
  var searchText="";
  console.log(req);
  console.log(req.body);
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

          /*searchText=searchText+'\\\"'+req.body.items[i]+'\\\"';*/

   }
   //searchText="\""+searchText+"\"";
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
  db.collection('enfesco').find().toArray((err, result) => {
      for (var i = 0; i < result.length; i++) {
        var searchText="";
        for (var j = 0; j < result[i].ingredients.length; j++) {
           searchText=searchText+result[i].ingredients[j].name+" ";

        }
        console.log(searchText);
         db.collection('enfesco').update({"_id" :result[i]._id },{$set : {"searchText":searchText}})
      }
    })
})


app.get('/find/:id', (req, res) => {
  console.log(new ObjectId(req.params.id));
  db.collection('enfesco').find({ "_id" : req.params.id}).toArray((err, result) => {
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

          /*searchText=searchText+'\\\"'+req.body.items[i]+'\\\"';*/

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
