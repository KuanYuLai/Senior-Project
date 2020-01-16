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
//import org.jeasy.rules.support.YamlRuleDefinitionReader;

import java.io.*;
import java.io.FileReader;
import java.util.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.*;

public class Launcher {

    public static void main(String[] args) throws Exception {

	// Read in values from provided JSON file
	Object obj = new JSONParser().parse(new FileReader(args[0]));
	JSONObject jo = (JSONObject) obj;


        // Create a new Job instance
        String customer = (String) jo.get("customer");
        String paperType = (String) jo.get("paperType");
        long numPages = (long) jo.get("numPages");
	double maxCoverage = (double) jo.get("maxCoverage");

        Job job = new Job(customer, paperType, numPages, maxCoverage);
	Facts facts = new Facts();
	facts.put("job", job);

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
	primerBARules.register(primerBAGroup);
	//primerBARules.register(BARule);
	//primerBARules.register(primerRule);

	// Create a default rules engine and fire rules on known racts
	RulesEngineParameters parameters = new RulesEngineParameters()
		.priorityThreshold(10)
		.skipOnFirstAppliedRule(false)
		.skipOnFirstFailedRule(false)
		.skipOnFirstNonTriggeredRule(false);

	RulesEngine rulesEngine = new DefaultRulesEngine(parameters);

	// Fire all of the rules	
	System.out.println("\nStarting...\n");

	System.out.println(job.toJSON());

	rulesEngine.fire(sizeAndCoverageRules, facts);
	rulesEngine.fire(primerBARules, facts);

	System.out.println(job.toJSON());

	// Print JSON output to a file
	BufferedWriter out = new BufferedWriter(new FileWriter("Output.json"));
	try {
		out.write(job.toJSON());
	}
	catch (IOException e) {
		System.out.println("Exception when saving data to Output.json");
	}
	finally {
		out.close();
	}

	System.out.println("\nFinished.\n");
    }
}
