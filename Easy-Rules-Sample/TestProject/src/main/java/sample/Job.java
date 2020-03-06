package sample;
import org.json.simple.JSONObject;


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
