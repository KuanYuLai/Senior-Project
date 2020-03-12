import React, { Component, Fragment } from 'react';
import { Button, Icon, Spin } from 'antd';
import { CSVLink } from "react-csv";
import ReactDataSheet from "react-datasheet";
import 'react-datasheet/lib/react-datasheet.css';

import { BuildSpreadsheet } from './JobHistory.js';
import Style from '../CSS/JobHistory.module.css'

//import Style from '../CSS/JobHistory.module.css'
import { ServerURL } from './Home';

export class JobResults extends Component {
	constructor(props) {
		super(props);

		this.state = {
			jobID: props.location.state.jobID,
			ready: false,
		};
	}

	componentDidMount = async () => {
		await this.fetchJob();

		var data = BuildSpreadsheet([this.state.jobID], this.state.jobResult);

		setTimeout(async () => {
			this.setState({
				spreadsheetData: data[0],
				exportData: data[1],
				ready: true
			});
		});
	}

	/* Calls the database to request job history. */
	fetchJob = async () => {
		await fetch(ServerURL + "job-history/" + this.state.jobID, {
			method: "GET",
			mode: 'cors',
			headers: {
				'Accept': 'application/json',
			}
		}).then(async (res) => {
			await res.json().then((data) => {
				this.setState({
					jobResult: [data]
				});
			});
		}).catch(err => {
			console.log(err);
			//this.fetchError("fetch job history");
		});
	}

	render() {
		const {
			ready,
			jobID,
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
					<h1>Job {jobID} Results</h1>
					<br /><br />

					<CSVLink data={exportData} filename={"Job_" + jobID + ".csv"}>
						<Button type="primary" style={{ marginBottom: 10 }}>
							<Icon className={Style.buttonIcon} type="file-excel" />
							Export to CSV
						</Button>
					</CSVLink>
					<ReactDataSheet
						data={spreadsheetData}
						valueRenderer={(cell) => cell.value}
						onChange={() => { }}
					/>;
				</Fragment>
			);
	}
}