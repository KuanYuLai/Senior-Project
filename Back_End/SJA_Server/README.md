# Instruction

## Description

Things SJA Engine do:

1. Get the input from the front-end .
2. Reformat the data from the website and send it to the rules engine.
3. Append an id to the rules engine result and send only the id back to the front-end.
4. Save the data from rules-engine with the id in the job-history file.
5. Send the requested job-history data to the front-end.

## Endpoint

### GET

- **/paper-db**: Return the data of the paper database file.
- **/job-history**: Return all records of the documented settings.
- **/job-history/{id}**: Return specific documented settings.

### POST

- **/new-job**: Takes the input of the user settings and forward to the rules engine. Send back the rules engine output with the given user settings. Both input and output are in JSON format.

## Change server URL

By default, both server is point to each other from our domain. You can update the URL in **url** variable in **get_engine_data** function to

```
Your_Domain:8080/path_of_your_rules_engine_server/new
```

in file

```
server.js
```

## Node.js

First, download and install Node.js with this [link](https://nodejs.org/en/).

Next, download and install npm with this [link](https://www.npmjs.com/get-npm).

## Installation

To install all of the pakcages require from the server
Run:

```
npm install
```

## Run Locally

To deploy the server locally, simply run the command:

```
npm start
```

and you can access the server with the link

```
localhost:8000
```

## Deployment

To deploy the SJA server to your cloud server. First, you have to make sure your server has **Node.js** and **npm**.

Next, install screen in your machine:

- Ubuntu & Debian

```
sudo apt install screen
```

- Fedora & CentOS

```
sudo yum install screen
```

Create a new screen:

```
screen -S session_name
```

then move the folder to your cloud server and run:

```
npm start
```

Now you can access the server with the URL:

```
your_domain_name:8000
```

Close the termainl without stopping the program will keep the program running until you stop it.

When you re-enter the termianl, simply run:

```
screen -r
```

to open the old session.

## Sample Testing

You can test the server by using [postman](https://www.postman.com/)

First, fire a POST request to the endpoint **/new-job**
With Input:

```
{
   "jobName":"Test",
   "qualityMode":"Quality",
   "pressUnwinderBrand":"EMT",
   "maxCoverage":50,
   "opticalDensity":100,
   "manufacturer":"Arsn",
   "productname":"Co J",
   "papertype":"Uncoated Treated",
   "papersubtype":"Text",
   "finish":"Matte",
   "weightgsm":90,
   "ruleset":"Default"
}
```

You should get an **ID**

Take that ID and fire a GET request to the endpoint **/job-history/ID_you_received**

You should get a output like this:

```
{
    "jobID": 4,
    "jobTime": "April 24 2020, 1:23:16 pm",
    "input": {
        "jobName": "TT0",
        "ruleset": "Default",
        "qualityMode": "Quality",
        "pressUnwinderBrand": "EMT",
        "maxCoverage": 50,
        "opticalDensity": 100,
        "manufacturer": "Arsn",
        "productname": "Co J",
        "papertype": "Uncoated Treated",
        "papersubtype": "Text",
        "finish": "Matte",
        "weightgsm": 90
    },
    "output": {
        "CoverageClass": "Medium",
        "CoatingClass": "Inkjet Treated Surface",
        "WeightClass": "Medium",
        "TargetSpeed": 25,
        "DryerPower": "40%-75%",
        "DryerZone": 1.25,
        "PrintZone": 1.25,
        "Unwinder": 1.25,
        "Rewinder": 1.25,
        "Primer": false,
        "BA": true,
        "Description": {
            "PrintZone": "Print Zone is 1.25, because unwinder is EMT, weight class is Medium",
            "Unwinder": "Unwinder is 1.25, because unwinder is EMT, weight class is Medium",
            "TargetSpeed": "Target speed is 25, because coverage class is Medium, weight class is Medium, coating class is Inkjet Treated Surface, quality mode is Quality",
            "WeightClass": "Weight class is Medium, because weight is between 150 and 75",
            "CoatingClass": "Coating class is Uncoated Treated - Inkjet Treated Surface, because paper type is Uncoated Treated, finish is Matte",
            "Rewinder": "Rewinder is 1.25, because unwinder is EMT, weight class is Medium",
            "DryerZone": "Dryer Zone is 1.25, because unwinder is EMT, weight class is Medium",
            "CoverageClass": "Coverage class is Medium, because coverage class is between 15 and 60",
            "DryerPower": "Dryer power is 40%-75%, because coverage class is Medium, weight class is Medium, coating class is Inkjet Treated Surface, quality mode is Quality"
        }
    }
}
```
