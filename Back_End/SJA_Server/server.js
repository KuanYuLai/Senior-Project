//Server
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
//Setting up parameter
const app = express();
const port = process.env.PORT || 8000;
//Other module
const request = require("request");
//const Promise = reuqire('promise');

//Other
const fs = require("fs");
const logger = require("./lib/logger");
//File
//const history = require('./data');
const job_history = require("./job_history");
// console.log("== data:", data);
//variable

app.use(bodyParser.json());
app.use(logger);
app.use(cors());

//Endpoint that returns paper type data
app.get("/paper-db", (req, res, next) => {
  var file = require("./paper-db");
  res.status(200).send(file);
});

//Endpoint that returns hisotry data
app.get("/job-history", (req, res, next) => {
  res.status(200).send(job_history);
});

//Endpoint that returns specific hisotry data
app.get("/job-history/:id", (req, res, next) => {
  console.log("  -- req.params:", req.params);
  const id = req.params.id;
  if (id == 0) res.status(400).send("Please input the id /job-history/{id}");
  else if (id > job_history.length) res.status(400).send("Invalid id");
  else res.status(200).send(job_history[id - 1]);
});

//Endpoint that returns hisotry data
app.get("/history", (req, res, next) => {
  var file = require("./data");
  res.status(200).send(file);
});

//Parse the input from the front-end to what the rules engine wants
function output_parser(input) {
  const def = ["job-rule", "BA-rule", "primer-rule"];
  var json = {};
  console.log("Name:" + input.jobName);
  json.jobName = input.jobName;
  json.qualityMode = input.qualityMode;
  json.CoverageSize = input.maxCoverage;
  json.opticalDensity = input.opticalDensity;
  json.paperType = input.papertype;
  json.papersubType = input.papersubtype;
  json.weightgsm = input.weightgsm;
  json.finish = input.finish;
  json.pressUnwinderBrand = input.pressUnwinderBrand;
  json.ruleset = new Array();
  json.ruleset = json.ruleset.concat(def);

  return json;
}

//Send the parsed input to the rules engine and get its output
function get_engine_data(input, callback) {
  //Prepare for the request
  const options = {
    url:
      "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/Engine/new",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Charset": "utf-8",
      "User-Agent": "SJA-Engine",
    },
    body: JSON.stringify(input),
  };

  //Fire request to the rules engine
  setting = request(options, (error, res, body) => {
    //Wait for the respond from j-easy engine
    if (error) {
      console.error(error);
      return;
    }
    //setting = body;
    callback(body);
    //console.log("==Repond content:\n" + setting);
  });
}

//Endpoint for creating new job
app.post("/new-job", (req, res, next) => {
  //console.log("  -- req.body:", req.body);
  const id = job_history.length + 1;

  //check if request has any data
  if (req.body) {
    // print out given data
    console.log("== Data from website: " + req.body);

    //Parse output_data
    var output_data = output_parser(req.body);
    console.log(
      "output data: " + JSON.stringify(output_data).replace(/\r?\n|\r/g, "")
    );

    //Sending input data to j-easy engine
    get_engine_data(output_data, async function (res_data) {
      console.log("==Repond content:\n" + res_data);

      //Saving return data to file
      var saved_data = JSON.parse('{"jobID": ' + id + "}");
      saved_data.jobTime = JSON.parse(
        '"' + moment().format("MMMM DD YYYY, hh:mm") + '"'
      );
      saved_data.input = req.body;
      saved_data.output = JSON.parse(res_data);
      job_history.push(saved_data);
      //history.push(res_data);
      res.status(201).send({ id: id });

      await fs.writeFile(
        "./job_history.json",
        JSON.stringify(job_history, null, 2).replace("[\\n\\t ]", ""),
        function (err) {
          if (err) console.log("Error append request body to file");
          console.log("Content appened");
        }
      );
    });
  } else {
    //Send error code 400 if reuqest doesn't has body
    res.status(400).send({
      err: "Request needs a body",
    });
  }
});

//Check undefined endpoint and return error
app.use("*", (req, res, next) => {
  //Send error code 404 if request with unknown endpoint
  res.status(404).send({
    err: "The path " + req.originalUrl + " doesn't exist",
  });
});

//Start the server with given port(Default: 8000)
app.listen(port, () => {
  console.log("== Server is listening on port:", port);
});
