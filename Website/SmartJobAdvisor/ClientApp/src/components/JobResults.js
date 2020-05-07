import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Icon, notification, Spin, Tooltip } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CSVLink } from "react-csv";
import ReactDataSheet from "react-datasheet";
import 'react-datasheet/lib/react-datasheet.css';

import { BuildSpreadsheet } from './JobHistory.js';
import Style from '../CSS/JobHistory.module.css'

import { ServerURL } from './Home';

export class JobResults extends Component {
	constructor(props) {
		super(props);

		/* Get the URL of the page, snip off everything after '?IDs=',
		 * take remaining string and split on ',' into an array. */
		var IDs = window.location.href.split('?IDs=')[1].split(',').map(function (v) {
			return parseInt(v, 10);
		});

		/* Get URL of the page, snip the '?justifications=' section to get 'true' or 'false'. */
		var justifications = window.location.href.split('?justifications=')[1].split('?IDs=')[0];
		justifications = (justifications === 'true');

		this.state = {
			jobIDs: IDs,
			jobResults: [],
			justifications: justifications,
			spreadsheetWidth: 0,
			showSpreadsheet: false,
			ready: false,
			error: false,
			windowWidth: 1000,
			windowHeight: 1000,
		};
	}

	/* Calls after the component mounts, fetches data and generates spreadsheet/export. */
	componentDidMount = async () => {
		const { jobIDs } = this.state;

		for (let i = 0; i < jobIDs.length; i++)
			await this.fetchJob(jobIDs[i]);

		this.generateData();
	}

	/* Called when the window is resized. Gets window dimensions passed from App.js. */
	componentDidUpdate(prevProps) {
		if (prevProps.windowWidth !== this.props.windowWidth || prevProps.windowHeight !== this.props.windowHeight) {
			this.setState({
				windowWidth: this.props.windowWidth,
				windowHeight: this.props.windowHeight
			});
		}
	}

	/* Calls the database to request job history. */
	fetchJob = async (id) => {
		await fetch(ServerURL + "job-history/" + id, {
			method: "GET",
			mode: 'cors',
			headers: {
				'Accept': 'application/json',
			}
		}).then(async (res) => {
			await res.json().then((data) => {
				var temp = [...this.state.jobResults];
				temp.push(data);

				this.setState({
					jobResults: temp
				});
			});
		}).catch(err => {
			this.fetchError("fetch job history");
		});
	}

	/* Called when there is an error in a fetch call. */
	fetchError = (type) => {
		this.alertPresent = false;

		/* This is for debouncing, so the alert doesn't appear twice. */
		if (!this.alertPresent) {
			this.alertPresent = true;

			notification['error']({
				message: 'Failed to ' + type + '.',
				description: "The server is probably down. Try again later.",
				duration: null
			});

			setTimeout(() => {
				this.alertPresent = false;
			}, 1000);
		}

		this.setState({ error: true });
	}

	/* Generate the data for the spreadsheet/export. */
	generateData = () => {
		const { jobIDs, jobResults, justifications } = this.state;

		if (!this.state.error) {
			var copyURL = window.location.href.split('job-results')[0];
			if (justifications)
				copyURL += 'job-results?justifications=true?IDs='
			else
				copyURL += 'job-results?justifications=false?IDs='

			copyURL += window.location.href.split('?IDs=')[1];

			var data = BuildSpreadsheet(jobIDs, jobResults, justifications);

			/* Name of the file generated when the "Export to CSV" button is clicked. */
			var fileName = "";
			if (jobIDs.length === 1)
				fileName = "Job";
			else
				fileName = "Compare_Jobs";

			for (let i = 0; i < jobIDs.length; i++)
				fileName += "_" + jobIDs[i];

			fileName += ".csv";

			this.setState({
				spreadsheetData: data[0],
				exportData: data[1],
				spreadsheetWidth: data[2],
				showSpreadsheet: true,
				copyURL: copyURL,
				ready: true,
				fileName: fileName
			});
		}
	}

	/* Triggered when checkbox is clicked. Toggles justification column. */
	handleJustifications = async () => {
		await this.setState({
			showSpreadsheet: false,
			justifications: !this.state.justifications
		});

		await this.generateData();
	}

	render() {
		const {
			ready,
			jobIDs,
			justifications,
			copyURL,
			fileName,
			spreadsheetData,
			showSpreadsheet,
			spreadsheetWidth,
			exportData
		} = this.state;

		if (!ready)
			return (
				<Spin />
			);
		else
			return (
				<Fragment>
					{jobIDs.length < 2 ?
						<h1>Job {jobIDs} Results</h1>
						:
						<h1>Job Comparison</h1>
					}
					<br /><br />

					<CSVLink data={exportData} filename={fileName}>
						<Button type="primary" style={{ marginBottom: 10, marginRight: 10, paddingLeft: 10, paddingRight: 10 }}>
							<Icon className={Style.buttonIcon} type="file-excel" />
							Export to CSV
						</Button>
					</CSVLink>
					<CopyToClipboard text={copyURL}>
						<Tooltip placement="top" trigger="click" title="Copied!">
							<Button
								type="default"
								style={{ marginBottom: 10, paddingLeft: 10, paddingRight: 10 }}
							>
								<Icon className={Style.buttonIcon} type="copy" />
								Copy Link to Clipboard
						</Button>
						</Tooltip>
					</CopyToClipboard>
					<Checkbox
						style={{ marginLeft: 16, marginBottom: 10 }}
						onChange={() => this.handleJustifications()}
						checked={justifications}
					>
						Justifications?
					</Checkbox>
					{showSpreadsheet ? 
						<div style={{ width: spreadsheetWidth, maxWidth: '100%', overflowX: 'scroll' }}>
							<div style={{ width: spreadsheetWidth }}>
								<ReactDataSheet
									data={spreadsheetData}
									valueRenderer={(cell) => <div style={{ textAlign: 'center' }}>{cell.value}</div>}
									onChange={() => { }}
								/>
							</div>
						</div>
						:
						null
					}
					
				</Fragment>
			);
	}
}