package sample;
import java.io.*;
import java.util.*;
import java.net.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.*;
import org.json.simple.JSONArray;

public class Job {
	// Variables that will be populated initially
	private String jobName;
	private String qualityMode;
	private long CoverageSize;
	private long opticalDensity;
	private String paperType;
	private String papersubType;
	private long weightgsm;
	private String finish;
	private String Unwinder;
    private Map<String, String> Description = new HashMap<String, String>();


	//Set Variables
	private String CoverageClass;
	private String WeightClass;
	private String CoatingClass;
	private long TargetSpeed;
	private String DryerPower;
    private double Unwinder_out;
    private double Rewinder_out;
    private double DryerZone;
    private double PrintZone;
	//-----old---------------
	private long pageCount;



	// Variables that will be set by rules
	private boolean BA;
	private boolean primer;
	private String jobSize;
	private String coverageAmt;

	// Class initializer
	public Job(String jobName, String qualityMode, long CoverageSize, long opticalDensity, String paperType, String papersubType, long weightgsm, String finish, String Unwinder) {
		this.jobName = jobName;
		this.qualityMode = qualityMode;
		this.CoverageSize = CoverageSize;
		this.opticalDensity = opticalDensity;
		this.paperType = paperType;
		this.papersubType = papersubType;
		this.weightgsm = weightgsm;
		this.finish = finish;
		this.Unwinder = Unwinder;

		//------old------
		this.BA = false;
		this.primer = false;
		this.jobSize = new String();
		this.coverageAmt = new String();
	}

	// Getters
	public String getjobName() {
		return jobName;
	}

	public String getqualityMode() {
		return qualityMode;
	}

	public long getCoverageSize() {
		return CoverageSize;
	}

	public long getopticalDensity() {
		return opticalDensity;
	}

	public String getpaperType() {
		return paperType;
	}

	public String getpapersubType() {
		return papersubType;
	}

	public long getweightgsm() {
		return weightgsm;
	}

	public String getfinish() {
		return finish;
	}

	public String getUnwinder() {
		return Unwinder;
	}

//---old getter-----
	public long getPageCount() {
		return pageCount;
	}

	public boolean getBA() {
		return BA;
	}

	public boolean getPrimer() {
		return primer;
	}

	public String getJobSize() {
		return jobSize;
	}

	public String getCoverageAmt() {
		return coverageAmt;
	}

	public int getint(int i){
		return i;
	}

    public String getCoverageClass() {
        return CoverageClass;
    }

	public String getWeightClass() {
		return WeightClass;
	}

	public String getCoatingClass() {
		return CoatingClass;
	}

	//Setters
	public void setCoverageClass(String classtype) {
		this.CoverageClass = classtype;
	}

	public void setWeightClass(String classtype) {
		this.WeightClass = classtype;
	}

	public void setCoatingClass(String classtype) {
		this.CoatingClass = classtype;
	}

	public void setTargetSpeed(long fpm) {
		this.TargetSpeed = fpm;
	}

	public void setDryerPower(String speed) {
		this.DryerPower = speed;
	}

	public void setUnwinder(double value) {
		this.Unwinder_out = value;
	}

	public void setRewinder(double value) {
		this.Rewinder_out = value;
	}

    public void setDryerZone(double value) {
        this.DryerZone = value;
    }

    public void setPrintZone(double value) {
        this.PrintZone = value;
    }

    public void setDescription(String key, String value){
        this.Description.put(key, value);
    }

    public void AppendDescription(String key, String value){
        String temp  = this.Description.get(key);
        temp = temp  + ", " + value;
        this.Description.put(key, temp);
        }


	// old ---Setters
	public void setBA(boolean choice) {
		this.BA = choice;
	}

	public void setPrimer(boolean choice) {
		this.primer = choice;
	}

	public void setJobSize(String size) {
		this.jobSize = size;
	}

	public void setCoverageAmt(String coverage) {
		this.coverageAmt = coverage;
	}

	// Function for checking if paper type requires bonding agent
	public boolean checkValidPaperType() {
		if (this.paperType.equals("PaperThatNeedsBA")) {
			return true;
		} else {
			return false;
		}
	}
	// Degrader
	public void CoverageClassDegrade() {
		if (this.CoverageClass.equals( "Heavy"))
			this.CoverageClass = "Medium";
		else
			this.CoverageClass = "Light";
	}

    public void DryerZoneReduce(double value){
        this.DryerZone -= value;
    }

    public void PrintZoneReduce(double value){
        this.PrintZone -= value;
    }

    public void RewinderReduce(double value){
        this.Rewinder_out -= value;
    }

    public void UnwinderReduce(double value){
        this.Unwinder_out -= value;
    }

    public void setTargetSpeed() throws Exception{
        String host_url = "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/rules/";
        //Getting JSON files
        URL TargetSpeed_JSON = new URL(host_url + "TargetSpeed.json");
        //Open connection
        URLConnection yc_targetspeed = TargetSpeed_JSON.openConnection();
        //Read buffer
        BufferedReader in_targetspeed = new BufferedReader(new InputStreamReader(yc_targetspeed.getInputStream()));

        Object target_obj = new JSONParser().parse(in_targetspeed);
        JSONArray target_array = (JSONArray) target_obj;

        //Searching for TargetSpeed matching data
        for(Object o : target_array){
            JSONObject target_o = (JSONObject) o;
            String CoverageClass = (String) target_o.get("CoverageClass");
            String WeightClass = (String) target_o.get("WeightClass");
            String CoatingClass = (String) target_o.get("CoatingClass");
            String QualityMode = (String) target_o.get("QualityMode");

            String coat_compare = "";
            if (getpaperType().contains("Coated"))
                coat_compare += "Coated";
            else if (getpaperType().contains("Uncoated"))
                coat_compare += "Uncoated";

            coat_compare += " - " + getCoatingClass();

            if (CoverageClass.equals(getCoverageClass()) && WeightClass.equals(getWeightClass()) && CoatingClass.equals(coat_compare) && QualityMode.equals(getqualityMode())){
                setTargetSpeed((long) target_o.get("TargetSpeed"));
                break;
            }
            setTargetSpeed(-1);
        }
    //Set Description
    setDescription("TargetSpeed", setValue("Target speed", TargetSpeed) + setInitReason("coverage class", CoverageClass) + setSubReason("weight class", WeightClass) +setSubReason("coating class", CoatingClass) + setSubReason("quality mode", qualityMode));

    }

    public void setDryerPower() throws Exception{
        String host_url = "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/rules/";
        //Getting JSON files
        URL dryerpower_JSON= new URL(host_url + "DryerPower.json");
        //Open connection
        URLConnection yc_dryerpower = dryerpower_JSON.openConnection();
        //Read buffer
        BufferedReader in_dryerpower = new BufferedReader(new InputStreamReader(yc_dryerpower.getInputStream()));

        Object dryer_obj = new JSONParser().parse(in_dryerpower);
        JSONArray dryer_array = (JSONArray) dryer_obj;

        //Searching for DryerPower matching data
        for(Object o : dryer_array){
            JSONObject dryer_o = (JSONObject) o;
            String CoverageClass = (String) dryer_o.get("CoverageClass");
            String WeightClass = (String) dryer_o.get("WeightClass");
            String CoatingClass = (String) dryer_o.get("CoatingClass");
            String QualityMode = (String) dryer_o.get("QualityMode");

            String coat_compare = "";
            if (getpaperType().contains("Coated"))
                coat_compare += "Coated";
            else if (getpaperType().contains("Uncoated"))
                coat_compare += "Uncoated";

            coat_compare += " - " + getCoatingClass();

            if (CoverageClass.equals(getCoverageClass()) && WeightClass.equals(getWeightClass()) && CoatingClass.equals(coat_compare) && QualityMode.equals(getqualityMode())){
                setDryerPower((String) dryer_o.get("DryerPower"));
                break;
            }
            setDryerPower("Can't Find data");
            //Debugger
            //setDryerPower(getCoverageClass() + getWeightClass() + coat_compare+getqualityMode());
        }
    setDescription("DryerPower", setValue("Dryer power", DryerPower) + setInitReason("coverage class", CoverageClass) + setSubReason("weight class", WeightClass) +setSubReason("coating class", CoatingClass) + setSubReason("quality mode", qualityMode));
    }

    //Description
    public String setValue(String vname, long value){
        return vname + " is " + Long.toString(value);
    }

    public String setValue(String vname, double value){
        return vname + " is " + Double.toString(value);
    }

    public String setValue(String vname, String value){
        return vname + " is " + value;
    }

    public String setInitReason(String vname, long value){
        return ", because " + setValue(vname, value);
    }

    public String setInitReason(String vname, String value){
        return ", because " + setValue(vname, value);
    }

    public String setInitReason(String vname, int upper, int lower){
        return ", because " + vname + " is between " + Integer.toString(upper) + " and " + Integer.toString(lower);
    }

    public String setSubReason(String vname, long value){
        return ", " + this.setValue(vname, value);
    }

    public String setSubReason(String vname, String value){
        return ", " + this.setValue(vname, value);
    }

    public String setSubReason(String vname, int upper, int lower){
        return ", " + vname + " is between " + Integer.toString(upper) + " and " + Integer.toString(lower);
    }

    public String setEndReason(String vname, long value){
        return ",and  " + this.setValue(vname, value);
    }

    public String setEndReason(String vname, String value){
        return ",and  " + this.setValue(vname, value);
    }

    public String setEndReason(String vname, int upper, int lower){
        return ",and " + vname + " is between " + Integer.toString(upper) + " and " + Integer.toString(lower);
    }
	//Return output data in JSON format
	public String toJSON() {

            int haveNext = Description.size();
            int size = haveNext;
            String Description_out = "";
            for (String key: Description.keySet()){
                Description_out += "\"" + key + "\" : \"" + Description.get(key) + "\"";

                haveNext -= 1;
                if (haveNext != 0){
                    Description_out += ", ";
                }
            }

		return "{" +
			"\"CoverageClass\":\"" + CoverageClass + "\"," +
			"\"CoatingClass\":\"" + CoatingClass + "\"," +
			"\"WeightClass\":\"" + WeightClass + "\"," +
			"\"TargetSpeed\":" + TargetSpeed + "," +
			"\"DryerPower\":\"" + DryerPower + "\"," +
            "\"DryerZone\":" + DryerZone + "," +
            "\"PrintZone\":" + PrintZone + "," +
            "\"Unwinder\":" + Unwinder_out + "," +
            "\"Rewinder\":" + Rewinder_out + "," +
			"\"Primer\": " + primer + "," +
            "\"BA\": " + BA + "," +
            "\"Description\": {" + Description_out + "}" +
			"}";
	}

	// Return detailed output data in beautify JSON format
	public String tobeautiJSON() {
		return "{\n" +
			"\t\"jobName\": \"" + jobName + "\",\n" +
			"\t\"qualityMode\": \"" + qualityMode + "\",\n" +
			"\t\"maxCoverage\": " + CoverageSize + ",\n" +
			"\t\"opticalDensity\": " + opticalDensity + ",\n" +
			"\t\"paperType\": \"" + paperType + "\",\n" +
			"\t\"papersubType\": \"" + papersubType + "\",\n" +
			"\t\"weightgsm\": " + weightgsm + ",\n" +
			"\t\"finish\": \"" + finish + "\",\n" +
			"\t\"CoverageClass\": \"" + CoverageClass + "\",\n" +
			"\t\"CoatingClass\": \"" + CoatingClass + "\",\n" +
			"\t\"WeightClass\": \"" + WeightClass + "\",\n" +
			"\t\"TargetSpeed\": " + TargetSpeed + ",\n" +
			"\t\"Primer\": " + primer + "\n" +
			"}\n";
	}
}
