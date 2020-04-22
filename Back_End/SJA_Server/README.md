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
