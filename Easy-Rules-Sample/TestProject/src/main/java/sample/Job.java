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


	//Set Variables
	private String CoverageClass;
	private String WeightClass;
	private String CoatingClass;
	private long TargetSpeed;
	private String DryerSpeed;
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
		this.BA = true;
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
		System.out.println("getpaperType called");
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

	public void setDryerSpeed(String speed) {
		this.DryerSpeed = speed;
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
	// Function for degrade CoverageClass
	public void CoverageClassDegrade() {
		if (this.CoverageClass.equals( "Heavy"))
			this.CoverageClass = "Medium";
		else
			this.CoverageClass = "Light";
	}

    public void setTargetSpeed() throws Exception{
        String host_url = "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/rules/";
        //Getting JSON files
        URL TargetSpeed_JSON = new URL(host_url + "Target_Speed.json");
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
            setTargetSpeed(0);
        }
    }

    public void setDryerPower() throws Exception{
        String host_url = "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/rules/";
        //Getting JSON files
        URL dryerpower_JSON= new URL(host_url + "dryer_power.json");
        //Open connection
        URLConnection yc_dryerpower = dryerpower_JSON.openConnection();
        //Read buffer
        BufferedReader in_dryerpower = new BufferedReader(new InputStreamReader(yc_dryerpower.getInputStream()));

        Object dryer_obj = new JSONParser().parse(in_dryerpower);
        JSONArray dryer_array = (JSONArray) dryer_obj;

        //Searching for DryerSpeed matching data
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
                setDryerSpeed((String) dryer_o.get("DryerPower"));
                break;
            }
            setDryerSpeed("Can't Find data");
        }
    }

	//Return output data in JSON format
	public String toJSON() {
		return "{" +
			"\"CoverageClass\":\"" + CoverageClass + "\"," +
			"\"CoatingClass\":\"" + CoatingClass + "\"," +
			"\"WeightClass\":\"" + WeightClass + "\"," +
			"\"TargetSpeed\":" + TargetSpeed + "," +
			"\"DryerSpeed\":\"" + DryerSpeed + "\"," +
            "\"DryerZone\":" + DryerZone + "," +
            "\"PrintZone\":" + PrintZone + "," +
            "\"Unwinder\":" + Unwinder_out + "," +
            "\"Rewinder\":" + Rewinder_out + "," +
			"\"Primer\": " + primer +
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
