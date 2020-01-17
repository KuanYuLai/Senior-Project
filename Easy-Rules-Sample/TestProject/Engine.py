import os
import urllib2
import requests
import json
import string

url = "http://localhost:8080/new"
#headers = {'Content-type': 'application/json'}
#GET call
print("==Firing GET call...\n")
r1 = requests.get(url)
print("Result: \n" + r1.content)
raw_input("...")

#POST Call
print("==Firing POST call...\n")
r = requests.post(url, json={
	"customer": "HP",
	"paperType": "PaperThatNeedsBA",
	"numPages": 100,
	"maxCoverage": 75.8,
})
result = r.content
print("Result: \n" + result)
raw_input("...")

#Printing History
print("==Printing History...\n")
with open('data.json') as f:
    data = json.load(f)
    print("Result...\n" + repr(data))
    f.close()
raw_input("...")

#Saving data to file
print("==Saving json to file...\n")
'''
#Loading file data
with open('data.json') as f:
    data = json.load(f)
    data.append(result)
    f.write()
    f.close()
'''
#Append newest JSON data
