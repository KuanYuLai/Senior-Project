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

    // Function for read in rule file
    private static BufferedReader getFile(String url, String filename) throws Exception {
        URL file = new URL(url + filename + ".yml");
        URLConnection yc = file.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(yc.getInputStream()));
        // Return the rule buffer
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

        //Initiate job values
        Job job = new Job(jobName, qualityMode, CoverageSize, opticalDensity, paperType, papersubType, weightgsm, finish, Unwinder, ruleclass);
      	Facts facts = new Facts();
      	facts.put("job", job);

        System.out.println("== Finish creating job...");

        // URL for rules folder
        String host_url = "http://ec2-35-163-184-27.us-west-2.compute.amazonaws.com:8080/rules/" + ruleclass + "/";

        // Create a default rules engine and fire rules on known racts
        RulesEngineParameters parameters = new RulesEngineParameters()
            .priorityThreshold(10)
            .skipOnFirstAppliedRule(false)
            .skipOnFirstFailedRule(false)
            .skipOnFirstNonTriggeredRule(false);

        RulesEngine rulesEngine = new DefaultRulesEngine(parameters);

        System.out.println("\nStarting...\n");

        MVELRuleFactory ruleFactory = new MVELRuleFactory(new YamlRuleDefinitionReader());
        Iterator it = ruleset.iterator();
        Rules rule;

        //Fire all given rules
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
