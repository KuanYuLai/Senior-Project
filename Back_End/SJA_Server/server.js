//Server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
//Setting up parameter
const app = express();
const port = process.env.PORT || 8000;
//Other module
const request = require('request');
const { spawn, execFile, exec } = require("child_process");
//Multer initialization
var multer = require('multer')
var storage = multer.diskStorage({
    destination: 'upload/',
    filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
})
var upload = multer({ storage: storage })

//Other
const fs = require('fs');
const logger = require('./lib/logger');
//File
const job_history = require('./job_history');

//Variable 
try{
var job_id = job_history[job_history.length-1].jobID; 
}
catch(err){
var job_id = 0;
}
app.use(bodyParser.json());
app.use(logger);
app.use(cors());

//Functions

//Evaluating PDF by executing shell command
function PDF_evaluation(callback){
	console.log("Start evaluating PDF");
	execFile('./eval.sh', ['upload/pdf', 'grey'], (err, stdout, stderr) => {
		if (err){
			console.log("Error occur");
			callback(err);
		}
		console.log("Finish evaluating");
		console.log(`stdout: ${stdout}`);
		callback(stdout);
	});
}

//Find jobID in job-history
//Return an object that contains: 
//	status "true" if jobID found, "false" if not found
//	index [index] if jobID found, "null" if not found
function findJob(id){
	var i;
//	console.log("== FindJob:\tid: " + id);
//	console.log("== FindJob:\tlength: " + job_history.length);
	for(i = 0; i < job_history.length; i++){
//		console.log("== FindJob\tjobID: " + job_history[i].jobID);
		if(job_history[i].jobID == id)
			return {status: true, index: i};
	}
	return {status: false, index: null};
}

//Saving job-history data to file
async function SaveToFile(job_history){
	await fs.writeFile("./job_history.json", JSON.stringify(job_history, null, 2).replace("[\\n\\t ]",''), function(err){
		if(err)  console.log("Error append request body to file");
		console.log("== SaveToFile: Content appened");
	});
}

//Generate new id for new job
//Return a highest id
function idGen(){
	//return job_history[job_history.length-1].jobID + 1;
	job_id += 1;
	console.log("== idGen: job_id: " + job_id);
	return job_id;
}

//Parse the input from the front-end
function output_parser(input){
		var basic_rule = ["job-rules", "paper-rule"];
        const T24 = ["BA-rule", "primer-rule"];
		const T25 = ["Enhancer-rule"];
        var json = {};

        console.log("Name:" + input.jobName + " Ruleset: " + input.ruleset);

		//Building output data object
        json.jobName = input.jobName;
        json.qualityMode = input.qualityMode;
        json.CoverageSize= input.maxCoverage;
        json.opticalDensity= input.opticalDensity;
        json.paperType = input.papertype;
        json.papersubType = input.papersubtype;
        json.weightgsm = input.weightgsm;
        json.finish = input.finish;
		json.pressUnwinderBrand = input.pressUnwinderBrand;
		json.ruleclass = input.ruleset;
        json.ruleset = new Array();

		//Decide what files to fire in the rules engine
		if (input.ruleset == "T24")
			basic_rule = basic_rule.concat(T24);
		else if (input.ruleset == "T25")
			basic_rule = basic_rule.concat(T25);

        json.ruleset = json.ruleset.concat(basic_rule);

        return json;
}


//Send parsed input to Rules Engine and get its output 
function get_engine_data(input, callback){
	const options = {
	    url: "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/Engine/new",
	    method: 'POST',
	    headers: {
		            'Accept': 'application/json',
		            'Accept-Charset': 'utf-8',
		            'User-Agent': 'SJA-Engine'
		        },
	    body: JSON.stringify(input)
	};
       setting = request(options, (error, res, body) =>{
    	//Wait for the respond from j-easy engine
		if(error){
			console.error(error);
			return;
		}
		//setting = body;
	      	callback(body);
		//console.log("==Repond content:\n" + setting);
    	});

}


//DELETE Endpoint
//Endpoint for deleting all job-history data
app.delete('/test/removeAll', (req, res) =>{
	job_history.splice(0, job_history.length);

	if (job_history.length == 0){
		SaveToFile(job_history);
		res.status(200).send({Success: "Job history data remove successfully."});
	}
	else 
		res.status(500).send({Error: "Error removing hisotry data. Please try again later."});
		
})


//Endpoint for deleting specific job-history data
app.delete('/job-history/remove/:id', (req, res) => {
	var id = req.params.id.split(",");
//	console.log("== remove: id: " + id);
	var result, fail = [];

	//Check and delete eahc history individually	
	id.forEach((item, index) => {
//		console.log("== Removing: id: " + item);
		result = findJob(item);
		if (result.status != false){
			job_history.splice(result.index, 1);
		}
		else{
			fail.push(item);
		}
	});

	//Update job_history file
	SaveToFile(job_history);

	if (fail.length == 0){
		res.status(200).send({Success: "jobID: " + id + " data remove successfully."});	
	}
	else{
		console.log("== failed jobID: " + fail);
		res.status(500).send({Error: "Error removing jobID: " + fail + " data. Please try again later."});
	}	
})

//GET Endpoint

//Endpoint that returns specific hisotry data
app.get('/job-history/:id', (req, res, next) => {
	const id = req.params.id;

	var result = findJob(id);

	if (result.status == false)
		res.status(400).send({Error: "Invalid id"});
	else
		res.status(200).send(job_history[result.index]);
});

//Endpoint that returns paper type data
app.get('/paper-db', (req, res, next) => {
	var file = require('./static/paper-db');
	res.status(200).send(file);
});

//Endpoint that returns hisotry data
app.get('/job-history', (req, res, next) => {
	res.status(200).send(job_history);
});

//POST Endpoint
//Endpoint for PDF coverage size including file upload
app.post('/analyze-pdf', upload.single('pdf'), (req, res) => {
	PDF_evaluation(function(result){
		var coverage = parseFloat(result);
		console.log("Coverage: " + coverage);
		res.status(200).send({Coverage: coverage});	
	});

});


//Endpoint for creating new job
app.post('/new-job', (req, res, next) => {
	const id = idGen();
	console.log("== new-job: id: " + id);

  if (req.body) {
	console.log("== Data from website: " + req.body);
	//Parse output_data
	var output_data = output_parser(req.body);
	console.log("output data: " + JSON.stringify(output_data).replace("[\\n\\t ]", ""));

	//Sending input data to j-easy engine
	get_engine_data(output_data, function(res_data) {
		//Check if Rules Engine returns error
		if (res_data.includes("Error")){
			console.log("== Repond content:\n" + res_data);
			res.status(500).send({Error: "Error occured, Please try again later"});
		}
		else{
			console.log("== Repond content:\n" + JSON.stringify(res_data).replace("[\\n\\t ]", ""));	
			//Saving return data to file
			var saved_data = JSON.parse('{"jobID": ' + id + '}');
			saved_data.result = JSON.parse(res_data);
			saved_data.input = req.body;
			saved_data.jobTime = JSON.parse('"' + moment().tz('America/Danmarkshavn').format('MMMM DD YYYY, h:mm:ss a z') + '"');
			job_history.push(saved_data);
			//history.push(res_data);
			res.status(201).send({id: id});

			//Save result to file		
			SaveToFile(job_history);
		}
	});
	
  } else {
    res.status(400).send({
      Error: "Request needs a body"
    });
  }
});

//Undefined URL handler
app.use('*', (req, res, next) => {
  res.status(404).send({
    Error: "The path " + req.originalUrl + " doesn't exist"
  });
});

//Set server listening port
app.listen(port, () => {
  console.log("== Server is listening on port:", port);
});
