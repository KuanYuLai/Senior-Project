import React, { Component, Fragment } from 'react';
import { Spin } from 'antd';
import ReactDataSheet from "react-datasheet";
import 'react-datasheet/lib/react-datasheet.css';

import { BuildSpreadsheet } from './JobHistory.js';

//import Style from '../CSS/JobHistory.module.css'
import { ServerURL } from './Home';

export class JobResults extends Component {
	constructor(props) {
		super(props);

		this.state = {
			jobID: props.location.state.jobID,
			ready: false
		};
	}

	componentDidMount = async () => {
		await this.fetchJob();

		setTimeout(async () => {
			this.setState({
				spreadsheetData: BuildSpreadsheet([this.state.jobID], this.state.jobResult),
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
			spreadsheetData
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

					<ReactDataSheet
						data={spreadsheetData}
						valueRenderer={(cell) => cell.value}
						onChange={() => { }}
					/>;
				</Fragment>
			);
	}
}