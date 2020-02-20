import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Button, Form, Modal, notification, Table, Row, Col } from 'antd';
import moment from 'moment';

import Style from '../CSS/JobHistory.module.css'
import { ServerURL } from './Home';

export class JobHistory extends Component {
	constructor() {
		super();

		this.sampleHistory = [{ "jobName": "Setting Advice", "qualityMode": "Quality", "maxCoverage": 50, "opticalDensity": 100, "papertype": "Uncoasted", "papersubtype": "Bond", "weightgsm": 90, "finish": "Smooth" }, { "jobName": "Setting Advice", "qualityMode": "Quality", "maxCoverage": 50, "opticalDensity": 100, "papertype": "Uncoasted", "papersubtype": "Bond", "weightgsm": 90, "finish": "Smooth" }, { "jobName": "Setting Advice", "qualityMode": "Quality", "maxCoverage": 50, "opticalDensity": 100, "papertype": "Uncoasted", "papersubtype": "Bond", "weightgsm": 90, "finish": "Smooth" }];

		this.sampleColumns = [
			{
				title: 'Job ID',
				dataIndex: 'jobid',
				width: 100,
				sorter: (a, b) => a.jobNumber - b.JobNumber,
			},
			/*
			{
				title: 'Date',
				dataIndex: 'date',
				width: 150,
                sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
				defaultSortOrder: 'descend',
            },
			*/
			{
				title: 'Job Name',
				dataIndex: 'jobName',
				width: 200
			},
            {
                title: 'Results',
                //dataIndex: 'results',
				render: (text, row) => <Button onClick={() => this.showResults(row.jobid)}>View</Button>,
            },
		];
		/*
		this.sampleData = [
			{
				jobId: 0,
                date: moment(new Date()).add(-20, 'days').format("MM-DD-YYYY"),
                //results: '',
            },
            {
                jobId: 1,
                date: moment(new Date()).add(-15, 'days').format("MM-DD-YYYY"),
                //results: '',
            },
            {
                jobId: 2,
                date: moment(new Date()).add(-10, 'days').format("MM-DD-YYYY"),
                //results: '',
            },
            {
                jobId: 3,
                date: moment(new Date()).add(-5, 'days').format("MM-DD-YYYY"),
                //results: '',
            },
            {
                jobId: 4,
                date: moment(new Date()).format("MM-DD-YYYY"),
                //results: '',
            },
		]
		*/

		this.state = {
			currentJobId: -1,
			modalVisible: false,
			modalContent: null,
			jobHistory: this.sampleHistory,
		}
	}

	componentDidMount = async () => {
		/* Fetch the job history from the server. Wait unfil fetch is complete to continue. */
		await this.fetchHistory();

		/* If there was an error fetching the paper database, don't attempt to populat dropdowns/radios. */
		if (typeof this.state.error === 'undefined' && this.state.error !== true) {
			var tableArray = [];
			var rowObject = {};

			for (let i = 0; i < this.state.jobHistory.length; i++) {
				rowObject = {
					jobid: this.state.jobHistory[i].jobid,
					jobName: this.state.jobHistory[i].jobName
				};

				tableArray.push(rowObject);
			}

			this.setState({
				tableData: tableArray
			})
		}
	}

	fetchHistory = async () => {
		/* Call database to request job history. */
		await fetch(ServerURL + "job-history/", {
			method: "GET",
			mode: 'cors',
			headers: {
				'Accept': 'application/json',
			}
		}).then(async (res) => {
			await res.json().then((data) => {
				this.setState({ jobHistory: data });
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

	/* Toggles the visibility of the job results modal. */
	toggleModal = () => {
		this.setState({
			modalVisible: !this.state.modalVisible
		})
	}

	showResults = (key) => {
		/* Get the data from the row in the table, organize it. */
		var currentData = [...this.state.jobHistory];

		currentData = currentData.filter(obj => {
			return obj.jobid === key;
		})[0];

		var modalInnards =
			<>
				<Row gutter={6}>
					<Col span={7}>
						<b>Job Name:</b>
					</Col>
					<Col span={17}>
						{currentData.jobName}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Quality Mode:</b>
					</Col>
					<Col span={17}>
						{currentData.qualityMode}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Max Coverage:</b>
					</Col>
					<Col span={17}>
						{currentData.maxCoverage}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Optical Density:</b>
					</Col>
					<Col span={17}>
						{currentData.opticalDensity}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Paper Type:</b>
					</Col>
					<Col span={17}>
						{currentData.papertype}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Paper Sub Type:</b>
					</Col>
					<Col span={17}>
						{currentData.papersubtype}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Weight (gsm):</b>
					</Col>
					<Col span={17}>
						{currentData.weightgsm}
					</Col>
				</Row>
				<Row gutter={7}>
					<Col span={7}>
						<b>Finish:</b>
					</Col>
					<Col span={17}>
						{currentData.finish}
					</Col>
				</Row>
			</>;


		this.setState({
			modalContent: modalInnards,
			currentJobId: key
		})

		/* Open the modal and display the data. */
		this.toggleModal();
	}

	render() {
		const { tableData, modalContent } = this.state;

		return (
			<Fragment>
				<h1>Job History</h1>
				<br />

				<Modal
					title={"Job " + this.state.currentJobId + " Results"}
					visible={this.state.modalVisible}
					onCancel={() => {
						this.toggleModal();
						this.setState({ currentJobId: -1 });
					}}
					destroyOnClose={true}
					footer={null}
				>
					{modalContent}
				</Modal>

                <Table
                    rowKey="jobid"
                    dataSource={tableData}
                    columns={this.sampleColumns}
                    style={{ width: 450 }}
				/>
			</Fragment>
		);
	}
}