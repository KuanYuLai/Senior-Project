package sample;

import org.jeasy.rules.api.Facts;
import org.jeasy.rules.api.Rule;
import org.jeasy.rules.api.Rules;
import org.jeasy.rules.api.RulesEngine;
import org.jeasy.rules.api.RulesEngine.*;
import org.jeasy.rules.api.RuleListener;
import org.jeasy.rules.core.RulesEngineParameters;
import org.jeasy.rules.core.DefaultRulesEngine;
import org.jeasy.rules.core.InferenceRulesEngine;
import org.jeasy.rules.mvel.MVELRule;
import org.jeasy.rules.mvel.MVELRuleFactory;
import org.jeasy.rules.mvel.MVELRuleFactory.*;
import org.jeasy.rules.support.*;


import java.io.*;
import java.util.*;
import java.net.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.*;
import org.json.simple.JSONArray;


public class Launcher {

    private static BufferedReader getFile(String url, String filename) throws Exception {
        URL file = new URL(url + filename + ".yml");
        URLConnection yc = file.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(yc.getInputStream()));
        return in;
    }

    public static String Cal(String args) throws Exception {
        System.out.println("== Starting Cal...");
      	// Read in values from provided JSON file
        Object obj = new JSONParser().parse(args);
      	JSONObject jo = (JSONObject) obj;
        // Create a new Job instance
        String jobName = (String) jo.get("jobName");
        String qualityMode = (String) jo.get("qualityMode");
        long CoverageSize = (long) jo.get("CoverageSize");
        long opticalDensity= (long) jo.get("opticalDensity");
        String paperType = (String) jo.get("paperType");
        String papersubType = (String) jo.get("papersubType");
	    long weightgsm = (long) jo.get("weightgsm");
        String finish = (String) jo.get("finish");
        String Unwinder = (String) jo.get("pressUnwinderBrand");
        String ruleclass = (String) jo.get("ruleclass");
        JSONArray ruleset = (JSONArray) jo.get("ruleset");


        Job job = new Job(jobName, qualityMode, CoverageSize, opticalDensity, paperType, papersubType, weightgsm, finish, Unwinder, ruleclass);
      	Facts facts = new Facts();
      	facts.put("job", job);

        System.out.println("== Finish creating job...");

      	// Create rules for job size and coverage
        MVELRuleFactory ruleFactory = new MVELRuleFactory(new YamlRuleDefinitionReader());

        String host_url = "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/rules/" + ruleclass + "/";

        /*
        //Get rules file from server
        URL job_file = new URL(host_url + "job-rules.yml");
        URL BA_file = new URL(host_url + "BA-rule.yml");
        URL primer_file = new URL(host_url + "primer-rule.yml");
        URL paper_file = new URL(host_url + "paper-rule.yml");
        //Open connection
        URLConnection yc_job = job_file.openConnection();
        URLConnection yc_BA = BA_file.openConnection();
        URLConnection yc_primer = primer_file.openConnection();
        URLConnection yc_paper = paper_file.openConnection();
        //Read buffer
        BufferedReader in_job = new BufferedReader(new InputStreamReader(yc_job.getInputStream()));
        BufferedReader in_BA = new BufferedReader(new InputStreamReader(yc_BA.getInputStream()));
        BufferedReader in_primer = new BufferedReader(new InputStreamReader(yc_primer.getInputStream()));
        BufferedReader in_paper = new BufferedReader(new InputStreamReader(yc_paper.getInputStream()));



      	// Create composite rule for determining if primer/BA is used
        Rules jobRule= ruleFactory.createRules(in_job);
        Rules BARule = ruleFactory.createRules(in_BA);
        Rules primerRule = ruleFactory.createRules(in_primer);
        Rules paperRule = ruleFactory.createRules(in_paper);
        */


        // Create a default rules engine and fire rules on known racts
        RulesEngineParameters parameters = new RulesEngineParameters()
            .priorityThreshold(10)
            .skipOnFirstAppliedRule(false)
            .skipOnFirstFailedRule(false)
            .skipOnFirstNonTriggeredRule(false);

        RulesEngine rulesEngine = new DefaultRulesEngine(parameters);

        //Firing given rules
        System.out.println("\nStarting...\n");


        Iterator it = ruleset.iterator();
        /*
            while(it.hasNext()){
                //System.out.println("== " + it.toString() + "\n");
                switch(it.next().toString()){
                    case "BA-rule":
                        Rules BARule = ruleFactory.createRules(getFile(host_url, "BA-rule"))
                        rulesEngine.fire(BARule, facts);
                        System.out.println("== BA-rule fired");
                        break;
                    case "primer-rule":
                        rulesEngine.fire(primerRule, facts);
                        System.out.println("== primer-rule fired");
                        break;
                    case "paper-rule":
                        rulesEngine.fire(paperRule, facts);
                        System.out.println("== paper-rule fired");
                        break;
                    case "job-rule":
                        rulesEngine.fire(jobRule, facts);
                        System.out.println("== job-rule fired");
                        break;
                    default:
                        System.out.println("== Unrecognized rule" + it.toString());
                }
            }
        */
        Rules rule;
        while(it.hasNext()){
            rule = ruleFactory.createRules(getFile(host_url, it.next().toString()));
            rulesEngine.fire(rule, facts);
        }

        //Print out result
        System.out.println(job.toJSON());

      	System.out.println("\nFinished.\n");

       return job.toJSON();

    }
}
