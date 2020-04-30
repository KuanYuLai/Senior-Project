import os
import urllib2
import requests
import json
import string
import pprint

url = "http://localhost:8080/new"
#headers = {'Content-type': 'application/json'}

#POST Call
print("== Firing POST call...\n")

'''
r = requests.post(url, json={
	"customer": "HP",
	"paperType": "PaperThatNeedsBA",
	"numPages": 100,
	"maxCoverage": 75.8,
	"ruleset": ["BA-rule", "primer-rule", "job-rule"]
})
'''

r = requests.post(url, json={
	"maxPage": 10,
	"paperType": "PaperThatNeedsBA",
	"paperProperties": {
		"surface": "Coated",
		"weight": "light",
		"finish": "matte"
	},
	"ruleset": ["BA-rule", "job-rule", "primer-rule"]
})
result = r.content
print("Result: \n" + result)
raw_input("")

#Saving data to file
print("== Saving json to file...\n")
with open('data.json', 'r') as f:
    data = json.load(f)
new_data = json.loads(result)
data.append(new_data)

with open('data.json', 'w') as f:
	json.dump(data,f)
f.close()

#Printing History
print("== Printing History...\n")
with open('data.json', 'r') as f:
    data = json.dumps(json.load(f),indent=4, separators=(',', ': '))
print("History: \n")
print(data)
f.close()

#Printing DB
print("== Printing paper-db...\n")
with open('paper-db.json', 'r') as f:
    data = json.dumps(json.load(f),indent=4, separators=(',', ': '))
print("DB:... \n")
print(data)
f.close()

#Append newest JSON data
