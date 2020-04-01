import React, { Component, Fragment } from 'react';
import { Button, Icon, notification, Spin } from 'antd';
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

		this.state = {
			//jobID: props.location.state.jobID,
			jobIDs: IDs,
			jobResults: [],
			ready: false,
			copied: false,
			error: false
		};
	}

	componentDidMount = async () => {
		const { jobIDs } = this.state;

		for (let i = 0; i < jobIDs.length; i++)
			await this.fetchJob(jobIDs[i]);

		if (!this.state.error) {
			var data = BuildSpreadsheet(jobIDs, this.state.jobResults);

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
				ready: true,
				fileName: fileName
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

	render() {
		const {
			ready,
			copied,
			jobIDs,
			fileName,
			spreadsheetData,
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
						<Button type="primary" style={{ marginBottom: 10, marginRight: 10 }}>
							<Icon className={Style.buttonIcon} type="file-excel" />
							Export to CSV
						</Button>
					</CSVLink>
					<CopyToClipboard text={window.location.href}>
						<Button
							type="default"
							style={{ marginBottom: 10, marginRight: 10 }}
							onClick={() => this.setState({ copied: true })}
						>
							<Icon className={Style.buttonIcon} type="copy" />
							Copy Link to Clipboard
						</Button>
					</CopyToClipboard>
					{copied ?
						<span style={{ color: 'blue' }}>Copied!</span>
						:
						null
					}
					<div style={{ width: (150 + (175 * jobIDs.length)), maxWidth: '100%', overflowX: 'scroll' }}>
						<div style={{ width: (150 + (175 * jobIDs.length)) }}>
							<ReactDataSheet
								data={spreadsheetData}
								valueRenderer={(cell) => cell.value}
								onChange={() => { }}
							/>
						</div>
					</div>
				</Fragment>
			);
	}
}