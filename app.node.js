/**
 * Connect through mongoDb
 */



var express = require('express');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")
var bodyParser= require('body-parser');
var app= express();
console.log("Hello");
var port = process.env.PORT || 8080;        // set our port


var transporter = nodemailer.createTransport(smtpTransport({
	host : "smtp.gmail.com",
	secureConnection : false,
	port:465,
	
	service:'Gmail',
	auth:{
		user:'mohitbaveja2011@gmail.com',
		pass:'xjzgezbemjultqas'
	}
}));
console.log(transporter);
var mailOptions = {
	    from: 'mohitbaveja2011@gmail.com', // sender address
	    to: 'mohit.baveja@accenture.com', // list of receivers
	    subject: 'Review Submiited', // Subject line
	    text: 'Thanks for Submitting an Review' // plaintext body
	   
	};


app.use(bodyParser.json()); 



var mongoose = require('mongoose');

//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');

var db = mongoose.connect('mongodb://mohitb:mL@b12#@ds159737.mlab.com:59737/codechecklist');
var codeSchema= new mongoose.Schema({
	questionId: String,
	  question: String
	  
	});
var loginSchema = new mongoose.Schema({
	  dname: String,
	  rname: String,
	  apiNumber:String
	  
	});

var apiSchema = new mongoose.Schema({
	  apiNumber: String,
	  apiName: String,
	  review : Boolean,
	  comments: {type : Array ,"default" :[] }
	  
});
var Bear = mongoose.model('Bear', codeSchema);

var loginDetail = mongoose.model('loginDetail', loginSchema);

var apiDetail = mongoose.model('apiDetail', apiSchema);



app.get('/questions', function(req, res) {
	return Bear.find().limit(5).exec(function(err,questions){
		if (!err) {
			  
			  res.header('Access-Control-Allow-Origin', '*');
			  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			  
		      return res.send(questions);
		    } else {
		      return console.log(err);
		    }
	});
    //res.json({ message: 'hooray! welcome to our api!' });   
});



// create a bear (accessed at POST http://localhost:8080/api/bears)
app.post('/questions',function(req, res) {
	
	for(var i=0;i<req.body.length;i++){
		var bear = new Bear();      // create a new instance of the Bear model
		bear.question = req.body[i].question;
	    bear.questionId = req.body[i].questionId;// set the bears name (comes from the request)
	    
	    //Save it in databse
	    bear.save(function(err) {
	    	if (!err) {
	    	      return console.log("created");
	    	    } else {
	    	      return console.log(err);
	    	    }

	    });
	}
	
});

//Push LoginDetais to DB
app.post('/loginDetails',function(req,res) {
	
	
	  
	var loginDetails = new loginDetail();
	loginDetails.dname = req.body.dname;
	loginDetails.rname = req.body.rname;
	loginDetails.apiNumber = req.body.apiNumber;
	return loginDetails.save(function(err){
		if (!err) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  	      return res.send(loginDetails);
  	    } else {
  	      return console.log(err);
  	    }
	});
});

app.get('/apiDetails',function(req,res){
	return apiDetail.find().exec(function(err,apiDetails){
		if (!err) {
			  
			  res.header('Access-Control-Allow-Origin', '*');
			  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			  
		      return res.send(apiDetails);
		    } else {
		      return console.log(err);
		    }
	});
});

app.post('/apiDetails',function(req,res){
	
	for(var i=0;i<req.body.length;i++){
		var apiDetails = new apiDetail();      // create a new instance of the Bear model
		apiDetails.apiNumber = req.body[i].apiNumber;
		apiDetails.apiName = req.body[i].apiName;// set the bears name (comes from the request)
	    apiDetails.review = req.body[i].review;
	   
	    //Save it in databse
		apiDetails.save(function(err) {
	    	if (!err) {
	    	      return console.log("created");
	    	    } else {
	    	      return console.log(err);
	    	    }

	    });
	}


});

app.put('/apiDetails',function(req,res){
	
	
	var apiNumber = req.body.apiNumber;
	var rFlag= req.body.rflag;
	console.log("Hello");
	var comments = req.body.comments;
	
	var arrComment = [];
	for(var i=0;i<comments.length;i++)
	{  
		var comment = {};
		comment.question = comments[i].question;
		comment.commentsQId = comments[i].commentsQId;
		arrComment.push(comment);
	}	
	console.log(arrComment);
	var query = {'apiNumber' : apiNumber};
	var newData = {'review': rFlag,'comments' : arrComment};
	
	return apiDetail.findOneAndUpdate(query,newData,function(err){
		if (!err) {
			console.log("saced");
			res.header('Access-Control-Allow-Origin', '*');
			transporter.sendMail(mailOptions,function(err,info){
				if(!err)
					console.log("Message Sent");
				
				else
					console.log("Error",err);
			});
  	      return apiDetail.find(function(err,questions){
  			if(!err)
  				return res.send(questions);
  		});
  	     
  	    } else {
  	      return console.log(err);
  	    }
	});
})


app.get('/apiDetails/:id',function(req,res){
	
	return apiDetail.findOne({'apiNumber' : req.params.id},function(err,result){
		if(!err)
			res.header('Access-Control-Allow-Origin', '*');
			return res.send(result);
		
	});
})



var server = app.listen(8081, function () {

	  var host = server.address().address
	  var port = server.address().port

	  console.log("Example app listening at http://%s:%s", host, port)

	})

