const express = require('express');
const bodyParser= require('body-parser')
const app = express();
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));


var db;
const MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;

MongoClient.connect('mongodb://enfesco:123456@ds029456.mlab.com:29456/enfesco', (err, database) => {
   if (err) return console.log(err)
	  db = database
    db.collection('enfesco').createIndex({"$**": "text"})
	  app.listen(process.env.PORT || 5000, () => {
	    console.log('listening on 5000')
	  })
})

app.use(bodyParser.urlencoded({extended : true}))

app.get('/', (req, res) => {
    res.render('pages/search.ejs', {foods: ""})
})

app.get('/contact', (req, res) => {
    res.render('pages/contact.ejs')
})

app.get('/about', (req, res) => {
    res.render('pages/contact.ejs');
})

app.get('/find/:id', (req, res) => {
  db.collection('enfesco').find({ "_id" : ObjectId(req.params.id)}).toArray((err, result) => {
      if (err) return console.log(err)
       console.log(result);
       res.render('pages/food.ejs', {food: result});
    })
})
app.post('/',(req,res)=>{
  var searchText="";

  if(!Array.isArray(req.body.items)){
    searchText = req.body.items;
  }
  else{
  for (var i = 0, len = req.body.items.length; i < len; i++) {
     if(i !=0 && i!=req.body.items.length)
       searchText=searchText+" "+req.body.items[i]+" ";
     else
        searchText=searchText+" "+req.body.items[i];
   }
  }
  console.log(searchText);
db.collection('enfesco').find({ $text: { $search : searchText}}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}})
.toArray((err, result) => {
    if (err) return console.log(err)
     console.log(result);
     res.render('pages/foods.ejs', {foods: result});
  })

})
