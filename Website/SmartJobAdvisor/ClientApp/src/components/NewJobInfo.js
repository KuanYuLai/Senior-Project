import React from 'react';

/* This file contains the information held in the info button popups in the NewJob form.
 * Having them all here makes them easier to edit, and saves some space in NewJob.js. */

const jobNameInfo =
	<span>
		The name to give the Job.                  <br /><br />
		Disabled when a PDF is uploaded, as the    <br />
		name of the PDF file will be used instead.
	</span>;

const rulesetInfo =
	<span>
		Which set of rules to apply to the inputs. <br /><br />
		Each ruleset is designed for a specific    <br />
		press family, so the chosen ruleset should <br />
		match the desired press to be used.
	</span>;

const qualityModeInfo =
	<span>
		The quality mode of the Job.              <br /><br />
		<b>Quality</b> runs slower, but the final <br />
		output looks nicer.                       <br />
		<b>Performance</b> is much faster, but    <br />
		sacrifices quality for speed.

	</span>;

const pressUnwinderBrandInfo =
	<span>
		The brand of press unwinder to <br />
		use for the Job.
	</span>;

const maxCoverageInfo =
	<span>
		The maximum ink coverage value for the Job     <br />
		(ratio of ink to page).                        <br /><br />
		The highest single-page coverage value         <br />
		should be used here.                           <br /><br />
		Disabled when a PDF is uploaded, as a tool     <br />
		will be called to automatically calculate this <br />
		value.
	</span>;

const opticalDensityInfo =
	<span>
		The optical density value for the Job <br />
		(the average opacity of ink).
	</span>;

const paperMfrInfo =
	<span>
		A list of paper manufacturers in the database. <br /><br />
		Narrows as other options are chosen.
	</span>;

const paperNameInfo =
	<span>
		A list of paper names in the database. <br /><br />
		Narrows as other options are chosen.
	</span>;

const paperTypeInfo =
	<span>
		A list of paper types in the database <br />
		(coated/uncoated, coating type).      <br /><br />
		Narrows as other options are chosen.
	</span>;

const paperSubTypeInfo =
	<span>
		A list of paper sub-types in the database. <br /><br />
		Narrows as other options are chosen.
	</span>;

const paperWeightInfo =
	<span>
		A list of paper weights in the database           <br />
		(how heavy the paper is, in grams/m<sup>2</sup>). <br /><br />
		Narrows as other options are chosen.
	</span>;

const paperFinishInfo =
	<span>
		A list of paper finishes in the database. <br /><br />
		Narrows as other options are chosen.
	</span>;

export {
	jobNameInfo,
	rulesetInfo,
	qualityModeInfo,
	pressUnwinderBrandInfo,
	maxCoverageInfo,
	opticalDensityInfo,
	paperMfrInfo,
	paperNameInfo,
	paperTypeInfo,
	paperSubTypeInfo,
	paperWeightInfo,
	paperFinishInfo
}