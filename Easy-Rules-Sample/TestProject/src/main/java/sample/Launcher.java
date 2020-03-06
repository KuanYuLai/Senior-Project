package sample;

import org.json.simple.JSONObject;

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
//import org.jeasy.rules.support.YamlRuleDefinitionReader;


import java.io.*;
import java.io.FileReader;
import java.util.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.*;
import org.json.simple.JSONArray;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;
//import javax.servlet.http.HttpServletRequest;

public class Launcher {

    public static String Cal(String args) throws Exception {
        System.out.println("== Starting Cal...");
      	// Read in values from provided JSON file
        Object obj = new JSONParser().parse(args);
      	JSONObject jo = (JSONObject) obj;

        // Create a new Job instance
        String paperType = (String) jo.get("paperType");
        long maxPage = (long) jo.get("maxPage");
        //JSONArray paperProp = (JSONArray) jo.get("paperProperties");
        JSONArray ruleset = (JSONArray) jo.get("ruleset");

        String customer = "HP";
        double maxCoverage = 3.3;
        Job job = new Job(customer, paperType, maxPage, maxCoverage);
      	Facts facts = new Facts();
      	facts.put("job", job);


        //Iterator it2 = paperProp.iterator();
        System.out.println("== it2: \n");
        /*while(it2.hasNext()){
            System.out.println(it2.next().toString());
        }*/
        //String str = (String) paperProp.get("weight");
        //System.out.println(str);
        //System.out.println(paperProp.optString("weight"));
        //System.out.println(paperProp["finish"]);


      	// Create rules for job size and coverage
        MVELRuleFactory ruleFactory = new MVELRuleFactory(new YamlRuleDefinitionReader());

      	Rules sizeAndCoverageRules = ruleFactory.createRules(new FileReader("./src/main/java/sample/job-rules.yml"));

      	// Create composite rule for determining if primer/BA is used
      	Rule BARule = ruleFactory.createRule(new FileReader("./src/main/java/sample/BA-rule.yml"));
      	Rule primerRule = ruleFactory.createRule(new FileReader("./src/main/java/sample/primer-rule.yml"));
      	ConditionalRuleGroup primerBAGroup = new ConditionalRuleGroup("primerBA", "Conditional Rule Group of primerRule and BARule", 1);

        primerBAGroup.addRule(BARule);
        primerBAGroup.addRule(primerRule);

      	Rules primerBARules = new Rules();

        Iterator it = ruleset.iterator();
        while(it.hasNext()){
            switch(it.next().toString()){
                case "BA-rule":
                    primerBARules.register(BARule);
                    System.out.println("== BA-rule added");
                    break;
                case "primer-rule":
                    primerBARules.register(primerRule);
                    System.out.println("== primer-rule added");
                    break;
                default:
                    //primerBARules.register(primerBAGroup);
            }
        }



      	// Create a default rules engine and fire rules on known racts
      	RulesEngineParameters parameters = new RulesEngineParameters()
      	    .priorityThreshold(10)
      		.skipOnFirstAppliedRule(false)
      		.skipOnFirstFailedRule(false)
      		.skipOnFirstNonTriggeredRule(false);

      	RulesEngine rulesEngine = new DefaultRulesEngine(parameters);

      	// Fire all of the rules
      	System.out.println("\nStarting...\n");

      	rulesEngine.fire(sizeAndCoverageRules, facts);
      	rulesEngine.fire(primerBARules, facts);

      	System.out.println(job.toJSON());

      	System.out.println("\nFinished.\n");

        return job.toJSON();

    }
}
