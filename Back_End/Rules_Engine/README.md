# Instruction

## Description

Things Rules Engine do:

1. Get the input from the SJA Engine .
2. Process the given input based on the given ruleset, the rules in the ruleset are saved on the server.
3. Send back the generated result to the SJA Engine.

## Endpoint

- **/new**: Takes the input from the SJA Engine and uses the given rules in the ruleset subject of the input to generate the result. The input is case-sensitive.

## Apache Maven

First, make sure you have installed Apache Maven. You can find the instruction of how to install Apache Maven [here](http://maven.apache.org/install.html).

## Installation

Enter the **TestProject** folder and Run:

```
mvn install
```

to install all of the require packages.

## Set up file serving folder

The Rules Engine server requires additional files  contain in the ***rules*** folder to operate. Therefore, you have to server the ***rules*** folder. To do that you can follow the instruction [here](https://www.moreofless.co.uk/static-content-web-pages-images-tomcat-outside-war/). The setting command should be 
```

<Context docBase="/Senior-Project/Back_End/rules" path="/rules" />
```

## Change server URL

By default, both server is point to each other from our domain. You can update the URL in **host_url** variable to

```
Your_Domain:8080/serving_folder_path_name/
```

in file [Launcher.java](TestProject/src/main/java/sample/Launcher.java) and [Job.java](TestProject/src/main/java/sample/Job.java)  

## Deploy Locally

Run:

```
mvn tomcat7:run
```

to run the server locally.

The defualt port is being set to 8080, you can access the server with the URL:

```
localhost:8080
```

## Deploy Remotely

If you want to deploy the server on your cloud server, first you have to install tomcat 7 in your cloud server. You can find the instruction [here](https://tecadmin.net/steps-to-install-tomcat-server-on-centos-rhel/).  
Next, run

```
mvn package
```

in the **TestProject** folder. This will generate a war file

```
TestProject/target/TestProject-3.4.0-SNAPSHOT.war
```

. Upload the war file to your tomcat server to deploy the Rules Engine server.

**Note**: When deploying the war file, tomcat server manager will ask you to set your preferred path name. So the complete URL will be:

```
Your_Domain:8080/preferred_path_name/new
```

## Sample Testing

You can test the server by using [Postman](https://www.postman.com/)

First, fire a POST request to the endpoint **/new**
With Input:

```
{
    "jobName": "Setting Advice",
    "qualityMode": "Performance",
    "CoverageSize": 50,
    "opticalDensity": 100,
    "paperType": "Uncoated Pro",
    "papersubType": "Cover",
    "weightgsm": 80,
    "finish": "Dull",
    "pressUnwinderBrand": "HNK",
    "ruleset": [
    	"job-rule",
        "paper-rule",
        "primer-rule",
        "BA-rule"
    ]
 }

```

You should get a output like this:

```
{
    "CoverageClass": "Medium",
    "CoatingClass": "Inkjet Treated Surface",
    "WeightClass": "Medium",
    "TargetSpeed": 50,
    "DryerPower": "85-%-95%",
    "DryerZone": 1.25,
    "PrintZone": 1.25,
    "Unwinder": 1.0,
    "Rewinder": 1.0,
    "Primer": true,
    "BA": false,
    "Description": {
        "PrintZone": "Print Zone is 1.25, because unwinder is HNK, weight class is Medium",
        "Unwinder": "Unwinder is 0.625, because unwinder is HNK, weight class is Medium",
        "TargetSpeed": "Target speed is 50, because coverage class is Medium, weight class is Medium, coating class is Inkjet Treated Surface, quality mode is Performance",
        "Primer": ", because Primer is Coating Class is Inkjet Surface",
        "WeightClass": "Weight class is Medium, because weight is between 150 and 75",
        "CoatingClass": "Coating class is Uncoated Pro - Inkjet Treated Surface, because paper type is Uncoated Pro, finish is Dull",
        "Rewinder": "Rewinder is 0.625, because unwinder is HNK, weight class is Medium",
        "DryerZone": "Dryer Zone is 1.25, because unwinder is HNK, weight class is Medium",
        "CoverageClass": "Coverage class is Medium, because coverage class is between 15 and 60",
        "DryerPower": "Dryer power is 85-%-95%, because coverage class is Medium, weight class is Medium, coating class is Inkjet Treated Surface, quality mode is Performance"
    }
}
```
### Postman Image
Sample1:
    - Input
    ![Sample Input 1](https://github.com/KuanYuLai/Senior-Project/blob/master/Classwork/Img/RE_IN_1.PNG)
    - Output
    ![Sample Output 1](https://github.com/KuanYuLai/Senior-Project/blob/master/Classwork/Img/RE_OUT_1.PNG)

Sample2:
    - Input
    ![Sample Input 2](https://github.com/KuanYuLai/Senior-Project/blob/master/Classwork/Img/RE_IN_2.PNG)
    - Output
    ![Sample Output 2](https://github.com/KuanYuLai/Senior-Project/blob/master/Classwork/Img/RE_OUT_2.PNG)

