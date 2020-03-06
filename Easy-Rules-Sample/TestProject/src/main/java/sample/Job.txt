package sample;

public class Job {
	// Variables that will be populated initially
	private String customer;
	private String paperType;
	private long pageCount;
	private double maxCoverage;

	// Variables that will be set by rules
	private boolean BA;
	private boolean primer;
	private String jobSize;
	private String coverageAmt;

	// Class initializer
	public Job(String customer, String paperType, long pageCount, double maxCoverage) {
		this.customer = customer;
		this.paperType = paperType;
		this.pageCount = pageCount;
		this.maxCoverage = maxCoverage;
		this.BA = true;
		this.primer = false;
		this.jobSize = new String();
		this.coverageAmt = new String();
	}

	// Getters
	public String getCustomer() {
		return customer;
	}

	public String getPaperType() {
		return paperType;
	}

	public long getPageCount() {
		return pageCount;
	}

	public double getMaxCoverage() {
		return maxCoverage;
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

	// Setters
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

	// For printing class data to a file in JSON format
	public String toJSON() {
		return "{\n" +
			"\t\"customer\": \"" + customer + "\",\n" +
			"\t\"paperType\": \"" + paperType + "\",\n" +
			"\t\"pageCount\": " + pageCount + ",\n" +
			"\t\"maxCoverage\": " + maxCoverage + ",\n" +
			"\t\"BA\": " + BA + ",\n" +
			"\t\"primer\": " + primer + ",\n" +
			"\t\"jobSize\": \"" + jobSize + "\",\n" +
			"\t\"coverageSize\": \"" + coverageAmt + "\"\n" +
			"}\n";
	}
}
