const express = require('express');
const bodyParser= require('body-parser')
const app = express();
app.set('view engine', 'ejs')


var db;
const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://enfesco:123456@ds029456.mlab.com:29456/enfesco', (err, database) => {
   if (err) return console.log(err)
	  db = database
    db.collection('enfesco').createIndex({"$**": "text"})
	  app.listen(3000, () => {
	    console.log('listening on 3000')
	  })
})

app.use(bodyParser.urlencoded({extended : true}))

app.get('/', (req, res) => {
  db.collection('enfesco').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('pages/index', {foods: result})
  })
})
app.get('/foods', (req, res) => {
  db.collection('enfesco').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('pages/index.ejs', {foods: result})
  })
})

app.get('/about', (req, res) => {
    res.render('pages/about.ejs');
})

app.get('/search',(req,res)=>{

  res.render('pages/search.ejs')
})


app.post('/search',(req,res)=>{
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
     res.render('pages/index.ejs', {foods: result});
  })
   
})