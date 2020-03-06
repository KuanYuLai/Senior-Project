import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Button, Icon, Modal, notification, Table, Row, Col } from 'antd';
import ReactDataSheet from "react-datasheet";
import 'react-datasheet/lib/react-datasheet.css';
import moment from 'moment';

import Style from '../CSS/JobHistory.module.css'
import { ServerURL } from './Home';


/* Constructs the spreadsheet containing the job results. Can also compare multiple jobs.
 * The function will be exported so that the jobResults page can use it as well. */
export const BuildSpreadsheet = function(keys, jobHistory) {
	//const { jobHistory } = this.state;

	var spreadsheetData = [];
	var temp = [];

	/* Get list of all keys in an entry, except for jobID. */
	var keyList = Object.keys(jobHistory[0]).filter((val) => {
		return val !== "jobID";
	});

	/* Get the data from the row in the table, organize it. */
	var currentData = [];

	/* The first column that holds the labels. Empty. */
	temp.push({ value: '', width: 150, readOnly: true });

	for (let i = 0; i < keys.length; i++) {
		currentData = jobHistory.filter(obj => {
			return obj.jobID === keys[i];
		})[0];

		/* Column for each job being compared. */
		temp.push({ value: 'Job ' + currentData.jobID, width: 175, readOnly: true });
	}

	spreadsheetData.push(temp);
	temp = [];

	/* Runs through the list of all keys (except jobID), making a row for each. */
	for (let j = 0; j < keyList.length; j++) {

		if (keyList[j] !== 'input' && keyList[j] !== 'output') {
			temp.push({ value: keyList[j], readOnly: true });

			/* Runs through the data in each job, pairing it with the label. */
			for (let k = 0; k < keys.length; k++) {
				currentData = jobHistory.filter(obj => {
					return obj.jobID === keys[k];
				})[0];

				temp.push({ value: currentData[keyList[j]] });
			}

			spreadsheetData.push(temp);
			temp = [];
		}
		else {
			temp.push({ value: keyList[j].toLocaleUpperCase(), readOnly: true });

			/* Empty space for that row. */
			for (let k = 0; k < keys.length; k++)
				temp.push({ value: '' });

			spreadsheetData.push(temp);
			temp = [];

			/* Get list of all keys in the sub-object. */
			var subKeyList = Object.keys(jobHistory[0][keyList[j]]).filter((val) => {
				return val;
			});

			for (let n = 0; n < subKeyList.length - 1; n++) {
				temp.push({ value: subKeyList[n], readOnly: true });

				for (let m = 0; m < keys.length; m++) {
					currentData = jobHistory.filter(obj => {
						return obj.jobID === keys[m];
					})[0];

					temp.push({ value: currentData[keyList[j]][subKeyList[n]] });
				}

				spreadsheetData.push(temp);
				temp = [];
			}
		}
	}

	return spreadsheetData;
}

/* The job history page displays a table of all previously completed jobs, sorted chronologically. */
export class JobHistory extends Component {
	constructor() {
		super();

		this.sampleColumns = [
			{
				title: 'Job ID',
				dataIndex: 'jobID',
				width: 100,
				sorter: (a, b) => a.jobID - b.jobID,
			},
			{
				title: 'Date',
				dataIndex: 'jobTime',
				width: 200,
                sorter: (a, b) => moment(a.jobTime).unix() - moment(b.jobTime).unix(),
				defaultSortOrder: 'descend',
			},
			/*
			{
				title: 'Job Name',
				dataIndex: 'jobName',
				sorter: (a, b) => { return a.jobName.localeCompare(b.jobName) },
			},
			*/
            {
                title: 'Results',
				render: (text, row) => <Button className={Style.resultsColumn} onClick={() => this.compareJobs([row.jobID])}>View</Button>,
				width: 80,
            },
		];

		this.state = {
			selectedRowKeys: [],
			currentJobID: -1,
			modalVisible: false,
			modalContent: null,
		};
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
					jobID: this.state.jobHistory[i].jobID,
					jobTime: this.state.jobHistory[i].jobTime,
					jobName: this.state.jobHistory[i].jobName
				};

				tableArray.push(rowObject);
			}

			this.setState({ tableData: tableArray })
		}
	}

	/* Calls the database to request job history. */
	fetchHistory = async () => {
		await fetch(ServerURL + "job-history", {
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

	/* Called when ticking a checkbox to select a row. */
	onSelectChange = selectedRowKeys => {
		this.setState({ selectedRowKeys });
	}

	/* Toggles the visibility of the job results modal. */
	toggleModal = () => {
		this.setState({
			modalVisible: !this.state.modalVisible
		})
	}

	/* Constructs the content of the modal. */
	compareJobs = (keys) => {
		/* Get the data from the row in the table, organize it. */
		const spreadsheetData = BuildSpreadsheet(keys, this.state.jobHistory);

		/* Build the ReactDataSheet component using the data returned from buildSpreadsheet(). */
		var modalInnards =
			<ReactDataSheet
				data={spreadsheetData}
				valueRenderer={(cell) => cell.value}
				onChange={() => { }}
			/>;

		this.setState({
			modalContent: modalInnards,
			currentJobID: keys.length === 1 ? keys[0] : null
		})

		/* Open the modal and display the data. */
		this.toggleModal();
	}

	render() {
		const { tableData, modalContent, selectedRowKeys } = this.state;

		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
		};

		return (
			<Fragment>
				<h1>Job History</h1>
				<br />

				<Modal
					title={selectedRowKeys.length === 1 ?
						"Job " + this.state.currentJobID + " Results"
						:
						"Job Comparison"
					}
					visible={this.state.modalVisible}
					onCancel={() => {
						this.toggleModal();
						this.setState({
							selectedRowKeys: [],
							currentJobID: -1
						});
					}}
					destroyOnClose={true}
					footer={null}
					width={selectedRowKeys.length === 0 ? 350 : ((selectedRowKeys.length) * 175) + 200}
				>
					{modalContent}
				</Modal>

				{/* Only render the clear button and row selection indication when rows are selected. */}
				<div className={Style.tableHeader}>
					{selectedRowKeys.length > 1 ?
						<Button
							className={Style.tableButton}
							onClick={() => this.compareJobs(selectedRowKeys)}
							type="primary"
						>
							<Icon className={Style.buttonIcon} type="diff" />
							Compare
						</Button>
						:
						null

					}
					{selectedRowKeys.length > 0 ?
						<>
							<Button
								className={Style.tableButton}
								onClick={() => this.setState({ selectedRowKeys: [] })}
								type="danger"
								ghost
							>
								<Icon className={Style.buttonIcon} type="undo" />
								Clear
							</Button>
							<span>{selectedRowKeys.length} job{selectedRowKeys.length == 1 ? '' : 's'} selected</span>
						</>
						:
						<br />
					}
				</div>

                <Table
					rowKey="jobID"
					rowSelection={rowSelection}
                    dataSource={tableData}
                    columns={this.sampleColumns}
					style={{ width: 650 }}
					scroll={{ y: 1000 }}
					bordered
				/>
			</Fragment>
		);
	}
}