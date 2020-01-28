import os
import urllib2
import requests
import json
import string

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
	"paperType": "PaperThatNONeedsBA",
	"paperProperties": [{
		"surface": "Coated",
		"weight": "light",
		"finish": "matte"
	}],
	"ruleset": ["BA-rule", "primer-rule"]
})

print (r.content)
