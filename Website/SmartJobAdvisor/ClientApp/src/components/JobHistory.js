import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Icon, Modal, notification, Table, Row, Col } from 'antd';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { CSVLink } from "react-csv";
import ReactDataSheet from "react-datasheet";
import 'react-datasheet/lib/react-datasheet.css';
import moment from 'moment';

import Style from '../CSS/JobHistory.module.css'
import { ServerURL } from './Home';


/* Constructs the spreadsheet containing the job results. Can also compare multiple jobs.
 * The function will be exported so that the jobResults page can use it as well. */
export const BuildSpreadsheet = function (keys, jobHistory) {
	/* Arrays to hold data. Separate arrays for spreadsheet and export, since format is different. */
	var spreadsheetData = [];
	var spreadsheetTemp = [];
	var exportData = [];
	var exportTemp = [];

	/* Get list of all keys in an entry, except for jobID. */
	var keyList = Object.keys(jobHistory[0]).filter((val) => {
		return val !== "jobID";
	});

	/* Get the data from the row in the table, organize it. */
	var currentData = [];

	/* The first column that holds the labels. Empty. */
	spreadsheetTemp.push({ value: '', width: 150, readOnly: true });
	exportTemp.push("");

	for (let i = 0; i < keys.length; i++) {
		currentData = jobHistory.filter(obj => {
			return obj.jobID === keys[i];
		})[0];

		/* Column for each job being compared. */
		spreadsheetTemp.push({ value: 'Job ' + currentData.jobID, width: 175, readOnly: true });
		exportTemp.push('Job ' + currentData.jobID);
	}

	spreadsheetData.push(spreadsheetTemp);
	spreadsheetTemp = [];
	exportData.push(exportTemp);
	exportTemp = [];

	/* Runs through the list of all keys (except jobID), making a row for each. */
	for (let j = 0; j < keyList.length; j++) {

		if (keyList[j] !== 'input' && keyList[j] !== 'output') {
			spreadsheetTemp.push({ value: keyList[j], readOnly: true });
			exportTemp.push(keyList[j]);

			/* Runs through the data in each job, pairing it with the label. */
			for (let k = 0; k < keys.length; k++) {
				currentData = jobHistory.filter(obj => {
					return obj.jobID === keys[k];
				})[0];

				spreadsheetTemp.push({ value: currentData[keyList[j]] });
				exportTemp.push(currentData[keyList[j]]);
			}

			spreadsheetData.push(spreadsheetTemp);
			spreadsheetTemp = [];
			exportData.push(exportTemp);
			exportTemp = [];
		}
		else {
			spreadsheetTemp.push({ value: keyList[j].toLocaleUpperCase(), readOnly: true });
			exportTemp.push(keyList[j].toLocaleUpperCase());

			/* Empty space for that row. */
			for (let k = 0; k < keys.length; k++) {
				spreadsheetTemp.push({ value: '' });
				exportTemp.push("");
			}

			spreadsheetData.push(spreadsheetTemp);
			spreadsheetTemp = [];
			exportData.push(exportTemp);
			exportTemp = [];

			/* Get list of all keys in the sub-object. */
			var subKeyList = Object.keys(jobHistory[0][keyList[j]]).filter((val) => {
				return val;
			});

			for (let n = 0; n < subKeyList.length - 1; n++) {
				spreadsheetTemp.push({ value: subKeyList[n], readOnly: true });
				exportTemp.push(subKeyList[n]);

				for (let m = 0; m < keys.length; m++) {
					currentData = jobHistory.filter(obj => {
						return obj.jobID === keys[m];
					})[0];

					spreadsheetTemp.push({ value: currentData[keyList[j]][subKeyList[n]] });
					exportTemp.push(currentData[keyList[j]][subKeyList[n]]);
				}

				spreadsheetData.push(spreadsheetTemp);
				spreadsheetTemp = [];
				exportData.push(exportTemp);
				exportTemp = [];
			}
		}
	}

	return [spreadsheetData, exportData];
}

/* The job history page displays a table of all previously completed jobs, sorted chronologically. */
class JobHistory extends Component {
	static propTypes = {
		cookies: instanceOf(Cookies).isRequired
	};

	constructor(props) {
		super(props);

		/* Get column checkbox values from cookies (if they exist, otherwise use defaults). */
		const { cookies } = props;

		var defaultCols = ["jobID", "jobTime", "jobName", "results"];
		var defaultGeneral = ["jobID", "jobTime", "jobName", "results"];
		var defaultInput = [];
		var defaultOutput = [];

		if (typeof cookies.get('defaultCols') !== 'undefined')
			defaultCols = cookies.get('defaultCols');
		if (typeof cookies.get('defaultGeneral') !== 'undefined')
			defaultGeneral = cookies.get('defaultGeneral');
		if (typeof cookies.get('defaultInput') !== 'undefined')
			defaultInput = cookies.get('defaultInput');
		if (typeof cookies.get('defaultOutput') !== 'undefined')
			defaultOutput = cookies.get('defaultOutput');

		/* Set some state values so that the states exist and don't cause an error when referenced. */
		this.state = {
			selectedRowKeys: [],
			currentJobID: -1,
			spreadsheetModalVisible: false,
			spreadsheetModal: null,
			columnModalVisible: false,
			columnModal: null,
			tableColumns: [],
			selectedColumns: defaultCols,
			generalCheckboxes: defaultGeneral,
			inputCheckboxes: defaultInput,
			outputCheckboxes: defaultOutput
		};
	}

	/* Called immediately after the constructor. Allows page to render with empty values before data is added to avoid a crash. */
	componentDidMount = async () => {
		/* Fetch the job history from the server. Wait unfil fetch is complete to continue. */
		await this.fetchHistory();

		/* If there was an error fetching the paper database, don't attempt to populate dropdowns/radios. */
		if (typeof this.state.error === 'undefined' && this.state.error !== true) {
			await this.buildTableColumns();
			await this.buildTable();
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

	/* Creates the contents for the column picker modal. */
	buildColumnChecklist = () => {
		/* Build the contents of the column select modal. */
		var colList1 = [
			{ label: "Job ID", value: "jobID", disabled: true },
			{ label: "Date", value: "jobTime", disabled: true },
			{ label: "Job Name", value: "jobName", disabled: true },
			{ label: "Results", value: "results", disabled: true },
		];
		var colList2 = [];
		var colList3 = [];

		/* Build the list of input values. */
		for (let i = 0; i < Object.keys(this.state.jobHistory[0].input).length; i++) {
			var tempTitle = [...this.state.jobHistory][0];

			tempTitle = Object.keys(tempTitle.input)[i].replace(/([a-z])([A-Z])/g, '$1 $2');
			tempTitle = tempTitle.charAt(0).toUpperCase() + tempTitle.slice(1);

			if (Object.keys(this.state.jobHistory[0].input)[i] !== 'jobName')
				colList2.push(
					{
						label: tempTitle,
						value: Object.keys(this.state.jobHistory[0].input)[i]
					},
				);
		}

		/* Build the list of output values. */
		for (let j = 0; j < Object.keys(this.state.jobHistory[0].output).length; j++) {
			var tempTitle = [...this.state.jobHistory][0];

			tempTitle = Object.keys(tempTitle.output)[j].replace(/([a-z])([A-Z])/g, '$1 $2');
			tempTitle = tempTitle.charAt(0).toUpperCase() + tempTitle.slice(1);

			if (Object.keys(this.state.jobHistory[0].output)[j] !== 'jobName')
				colList3.push(
					{
						label: tempTitle,
						value: Object.keys(this.state.jobHistory[0].output)[j]
					},
				);
		}

		/* Build checkbox lists for each section. Helps with formatting. */
		var alwaysActiveCols = this.buildCheckboxes(colList1, 'general', 6, true);
		var jobInputCols = this.buildCheckboxes(colList2, 'input');
		var jobOutputCols = this.buildCheckboxes(colList3, 'output');

		var modalInnards =
			<>
				<b>Always-Active Columns</b><br />
				{alwaysActiveCols}
				<br /><br />

				<b>Job Input Columns</b>
				{jobInputCols}
				<br /><br />

				<b>Job Output Columns</b>
				{jobOutputCols}
			</>;

		this.setState({
			columnModal: modalInnards
		});
	}

	/* Holds values in each checkbox, updates immediately when a checkbox is clicked.
	 * Stores values temporarily before they are committed over to the selectedColumns state array. */
	onCheckboxChange = (checkedValues, type) => {
		switch (type) {
			case 'input':
				this.setState({ inputCheckboxes: checkedValues });
				break;
			case 'output':
				this.setState({ outputCheckboxes: checkedValues });
				break;
		}
	}

	/* When the columnChange modal 'Ok' button is clicked, transfer all checkbox arrays
	 * to the selectedColumns array, then rebuild the table with the new column list. */
	columnChangeConfirm = () => {
		const {
			generalCheckboxes,
			inputCheckboxes,
			outputCheckboxes
		} = this.state;

		var temp = [];

		/* Collect all checkbox values (except "results"), concat into one array, then append "results" to the end. */
		temp = temp.concat(generalCheckboxes.slice(0, -1));
		temp = temp.concat(inputCheckboxes);
		temp = temp.concat(outputCheckboxes);
		temp = temp.concat("results");

		/* Initialize cookies and set them to remember checkbox selection */
		const { cookies } = this.props;

		cookies.set('defaultCols', temp, { path: '/' });
		cookies.set('defaultGeneral', generalCheckboxes, { path: '/' });
		cookies.set('defaultInput', inputCheckboxes, { path: '/' });
		cookies.set('defaultOutput', outputCheckboxes, { path: '/' });

		/* Set selected columns, rebuild table. */
		this.setState({
			selectedColumns: temp,
			columnModalVisible: false
		}, () => {
			this.buildTableColumns();
			this.buildTable();
		});
	}

	/* Helper function to generate checkbox grids from a list of strings. */
	buildCheckboxes = (list, type, span = 8, disabled = false) => {
		return (
			<Checkbox.Group style={{ width: '100%' }} defaultValue={this.state.selectedColumns} onChange={(vals) => { this.onCheckboxChange(vals, type) }}>
				<Row>
					{
						list.map((item) => {
							return (
								<Col key={item.label} span={span}>
									<Checkbox disabled={disabled} value={item.value}>{item.label}</Checkbox>
								</Col>
							);
						})
					}
				</Row>
			</Checkbox.Group>
		);
	}

	/* Builds the column structure of the table based on what columns have been selected. */
	buildTableColumns = () => {
		const { selectedColumns, jobHistory } = this.state;

		var tempCol = [];
		var tempWidth = 800;

		/* Add base columns that cannot be removed. */
		tempCol.push(
			{
				title: 'Job ID',
				dataIndex: 'jobID',
				width: 100,
				sorter: (a, b) => a.jobID - b.jobID,
				fixed: 'left'
			},
			{
				title: 'Date',
				dataIndex: 'jobTime',
				width: 225,
				sorter: (a, b) => moment(a.jobTime).unix() - moment(b.jobTime).unix(),
				defaultSortOrder: 'descend',
			},
			{
				title: 'Job Name',
				dataIndex: 'jobName',
				sorter: (a, b) => { return a.jobName.localeCompare(b.jobName) },
			},
		);

		/* Add the rest of the selected columns. */
		for (let i = 0; i < selectedColumns.length; i++) {
			if (selectedColumns[i] !== 'jobID' && selectedColumns[i] !== 'jobTime' && selectedColumns[i] !== 'jobName' && selectedColumns[i] !== 'results') {
				var tempTitle = selectedColumns[i].replace(/([a-z])([A-Z])/g, '$1 $2');
				tempTitle = tempTitle.charAt(0).toUpperCase() + tempTitle.slice(1);

				/* Check if value is number or string. If number sort rows by number, if string sort rows by localecompare. */
				if ((typeof jobHistory[0].input[selectedColumns[i]] === 'string') || (typeof jobHistory[0].output[selectedColumns[i]] === 'string'))
					tempCol.push(
						{
							title: tempTitle,
							dataIndex: selectedColumns[i],
							width: 175,
							sorter: (a, b) => { return a[selectedColumns[i]].localeCompare(b[selectedColumns[i]]) },
						},
					);
				else
					tempCol.push(
						{
							title: tempTitle,
							dataIndex: selectedColumns[i],
							width: 175,
							sorter: (a, b) => a[selectedColumns[i]] - b[selectedColumns[i]],
						},
					);

				tempWidth += 175;
			}
		}

		/* Add results columns that cannot be removed. */
		tempCol.push(
			{
				title: 'Results',
				render: (text, row) => <Button className={Style.resultsColumn} onClick={() => { this.compareJobs([row.jobID]) } }>View</Button>,
				width: 80,
				fixed: 'right'
			},
		);

		this.setState({
			tableColumns: tempCol,
			tableWidth: tempWidth
		});
	}

	/* Build the table rows depending on what checkboxes are selected. */
	buildTable = () => {
		const { jobHistory, selectedColumns } = this.state;

		var tableArray = [];
		var rowObject = {};

		/* Create an entry in the table for each object in jobHistory. */
		for (let i = 0; i < jobHistory.length; i++) {
			/* Add data from correct spot. Column data may be surface level, or child of 'input'/'output' */
			for (let j = 0; j < selectedColumns.length; j++) {
				if (typeof jobHistory[i][selectedColumns[j]] !== 'undefined')
					rowObject[selectedColumns[j]] = jobHistory[i][selectedColumns[j]];
				else if (typeof jobHistory[i].input[selectedColumns[j]] !== 'undefined')
					rowObject[selectedColumns[j]] = jobHistory[i].input[selectedColumns[j]];
				else if (typeof jobHistory[i].output[selectedColumns[j]] !== 'undefined')
					rowObject[selectedColumns[j]] = jobHistory[i].output[selectedColumns[j]];
			}

			/* Add the row to the table data array, clear the row object for next run. */
			tableArray.push(rowObject);
			rowObject = {};
		}

		/* Save generated table rows to state so they can be used by the table. */
		this.setState({ tableData: tableArray })
	}

	/* Called when ticking a checkbox to select a row. */
	onSelectChange = selectedRowKeys => {
		this.setState({ selectedRowKeys });
	}

	/* Toggles the visibility of the job results modal. */
	toggleModal = (type) => {
		if (type === "spreadsheet")
			this.setState({
				spreadsheetModalVisible: !this.state.spreadsheetModalVisible
			});
		else if (type === "columns")
			this.setState({
				columnModalVisible: !this.state.columnModalVisible
			});
	}

	/* Constructs the content of the modal. */
	compareJobs = (keys) => {
		/* Get the data from the row in the table, organize it. */
		const spreadExportData = BuildSpreadsheet(keys, this.state.jobHistory);

		const spreadsheetData = spreadExportData[0];
		const exportData = spreadExportData[1];

		/* Name of the file generated when the "Export to CSV" button is clicked. */
		var fileName = "";
		if (keys.length === 1)
			fileName = "Job";
		else
			fileName = "Compare_Jobs";

		for (let i = 0; i < keys.length; i++)
			fileName += "_" + keys[i];

		fileName += ".csv";

		/* Build the ReactDataSheet component using the data returned from buildSpreadsheet(). */
		var modalInnards =
			<>
				<CSVLink data={exportData} filename={fileName}>
					<Button type="primary" style={{ marginBottom: 10 }}>
						<Icon className={Style.buttonIcon} type="file-excel" />
						Export to CSV
					</Button>
				</CSVLink>
				<ReactDataSheet
					data={spreadsheetData}
					valueRenderer={(cell) => cell.value}
					onChange={() => { }}
				/>
			</>;

		this.setState({
			spreadsheetModal: modalInnards,
			currentJobID: keys.length === 1 ? keys[0] : null
		})

		/* Open the modal and display the data. */
		this.toggleModal("spreadsheet");
	}

	render() {
		const {
			tableData,
			tableColumns,
			tableWidth,
			spreadsheetModal,
			spreadsheetModalVisible,
			columnModal,
			columnModalVisible,
			selectedRowKeys
		} = this.state;

		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
			fixed: 'left'
		};

		return (
			<Fragment>
				<h1>Job History</h1>
				<br />

				{/* Modal for job results/comparison spreadsheet. */}
				<Modal
					title={selectedRowKeys.length === 1 ?
						"Job " + this.state.currentJobID + " Results"
						:
						"Job Comparison"
					}
					visible={spreadsheetModalVisible}
					onCancel={() => {
						this.toggleModal("spreadsheet");
						this.setState({
							selectedRowKeys: [],
							currentJobID: -1
						});
					}}
					destroyOnClose={true}
					footer={null}
					width={selectedRowKeys.length === 0 ? 350 : ((selectedRowKeys.length) * 175) + 200}
				>
					{spreadsheetModal}
				</Modal>

				{/* Modal for choosing active column in the jobHistory table. */}
				<Modal
					title={"Select Visible Columns"}
					visible={columnModalVisible}
					onOk={this.columnChangeConfirm}
					onCancel={() => {
						this.toggleModal("columns");
					}}
					destroyOnClose={true}
					width={450}
				>
					{columnModal}
				</Modal>

				{/* Only render the clear button and row selection indication when rows are selected. */}
				<div className={Style.tableHeader}>
					<Button
						className={Style.tableButton}
						onClick={() => {
							this.buildColumnChecklist();
							this.toggleModal("columns");
						}}
						type="default"
					>
						<Icon className={Style.buttonIcon} type="setting" />
							Columns
					</Button>
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
							<span>{selectedRowKeys.length} job{selectedRowKeys.length === 1 ? '' : 's'} selected</span>
						</>
						:
						<br />
					}
				</div>

                <Table
					rowKey="jobID"
					rowSelection={rowSelection}
					dataSource={tableData}
					columns={tableColumns}
					style={{ width: tableWidth, maxWidth: '100%' }}
					scroll={{ y: 1000, x: tableWidth - 100 }}
					bordered
					pagination={{ defaultPageSize: 10, showQuickJumper: true, showSizeChanger: true, pageSizeOptions: ['10', '20', '30'] }}
				/>
			</Fragment>
		);
	}
}

export default withCookies(JobHistory);