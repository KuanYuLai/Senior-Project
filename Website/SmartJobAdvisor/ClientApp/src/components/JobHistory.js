import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Icon, Modal, notification, Table, Tooltip, Row, Col } from 'antd';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CSVLink } from "react-csv";
import ReactDataSheet from "react-datasheet";
import 'react-datasheet/lib/react-datasheet.css';
import moment from 'moment';

import Style from '../CSS/JobHistory.module.css'
import { ServerURL } from './Home';


/* Constructs the spreadsheet containing the job results. Can also compare multiple jobs.
 * The function will be exported so that the jobResults page can use it as well. */
export const BuildSpreadsheet = function (keys, jobHistory, justifications) {
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

		/* Column for each job being compared. If justifications are on,
		 * additionalcolumn to the right and the header column (Job #) spans two columns. */
		if (justifications) {
			spreadsheetTemp.push({ value: 'Job ' + currentData.jobID, colSpan: 2, readOnly: true });
			exportTemp.push('Job ' + currentData.jobID);
			exportTemp.push('Job ' + currentData.jobID + ' Justifications');
		} else {
			spreadsheetTemp.push({ value: 'Job ' + currentData.jobID, width: 175, readOnly: true });
			exportTemp.push('Job ' + currentData.jobID);
		}
	}

	/* Push temp data to main object, clear temp data. */
	spreadsheetData.push(spreadsheetTemp);
	spreadsheetTemp = [];
	exportData.push(exportTemp);
	exportTemp = [];

	/* Runs through the list of all keys (except jobID), making a row for each. */
	for (let j = 0; j < keyList.length; j++) {

		if (keyList[j] !== 'input' && keyList[j] !== 'output') {
			spreadsheetTemp.push({ value: keyList[j], width: 150, readOnly: true });
			exportTemp.push(keyList[j]);

			/* Runs through the data in each job, pairing it with the label. */
			for (let k = 0; k < keys.length; k++) {
				currentData = jobHistory.filter(obj => {
					return obj.jobID === keys[k];
				})[0];

				/* If justifications are enabled, make 'input' span 2 columns.
				 * Otherwise, make it only one column of width 175px. */
				if (justifications) {
					spreadsheetTemp.push({ value: currentData[keyList[j]], colSpan: 2 });
					exportTemp.push(currentData[keyList[j]]);
					exportTemp.push("");
				} else {
					spreadsheetTemp.push({ value: currentData[keyList[j]], width: 175 });
					exportTemp.push(currentData[keyList[j]]);
				}
			}

			/* Push temp data to main object, clear temp data. */
			spreadsheetData.push(spreadsheetTemp);
			spreadsheetTemp = [];
			exportData.push(exportTemp);
			exportTemp = [];
		}
		else {
			/* Add the row header for the key. */
			spreadsheetTemp.push({ value: keyList[j].toLocaleUpperCase(), width: 150, readOnly: true });
			exportTemp.push(keyList[j].toLocaleUpperCase());

			/* Empty space for that row. */
			for (let k = 0; k < keys.length; k++) {
				if (justifications) {
					/* Justifications for output. */
					spreadsheetTemp.push({ value: "", colSpan: 2 });
					exportTemp.push("");
					exportTemp.push("");
				} else {
					spreadsheetTemp.push({ value: '', width: 175 });
					exportTemp.push("");
				}
			}

			/* Push temp data to main object, clear temp data. */
			spreadsheetData.push(spreadsheetTemp);
			spreadsheetTemp = [];
			exportData.push(exportTemp);
			exportTemp = [];

			/* Get list of all keys in the sub-object. */
			var subKeyList = Object.keys(jobHistory[0][keyList[j]]).filter((val) => {
				return val;
			});

			/* Remove 'Descriptions' key from subKeyList as it is used differently. */
			subKeyList.splice(subKeyList.indexOf("Description"), 1);

			/* Run through subKeyList object, adding rows and values for each key. */
			for (let n = 0; n < subKeyList.length; n++) {
				/* Add the row header for the key. */
				spreadsheetTemp.push({ value: subKeyList[n], width: 150, readOnly: true });
				exportTemp.push(subKeyList[n]);

				/* Append info to row for each job. */
				for (let m = 0; m < keys.length; m++) {
					/* Get the data for the job based on the currently selected key. */
					currentData = jobHistory.filter(obj => {
						return obj.jobID === keys[m];
					})[0];

					/* Convert booleans to strings if need be. */
					var tempVal = currentData[keyList[j]][subKeyList[n]];
					if (typeof tempVal === 'boolean')
						tempVal = tempVal.toString();

					/* If justifications are active, make 'input' values span 2 columns (since there's no justification for them),
					 * handle output values normally. If justifications are not active, don't make input values span 2 columns. */
					if (justifications) {
						if (keyList[j] === 'input') {
							spreadsheetTemp.push({ value: tempVal, colSpan: 2 });
							exportTemp.push(tempVal);
							exportTemp.push("");
						} else {
							spreadsheetTemp.push({ value: tempVal, width: 175 });
							exportTemp.push(tempVal);
							spreadsheetTemp.push({ value: currentData.output.Description[subKeyList[n]], width: 250 });
							exportTemp.push(currentData.output.Description[subKeyList[n]]);
						}
					} else {
						spreadsheetTemp.push({ value: tempVal, width: 175 });
						exportTemp.push(tempVal);
					}
				}

				/* Push temp data to main object, clear temp data. */
				spreadsheetData.push(spreadsheetTemp);
				spreadsheetTemp = [];
				exportData.push(exportTemp);
				exportTemp = [];
			}
		}
	}

	/* Calculate width for spreadsheet based on number of jobs
	 * and whether or not justifications are being displayed. */
	var spreadsheetWidth = 150 + (175 * keys.length);
	if (justifications)
		spreadsheetWidth += 250 * keys.length;

	return [spreadsheetData, exportData, spreadsheetWidth];
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
			justifications: true,
			columnModalVisible: false,
			columnModal: null,
			tableColumns: [],
			selectedColumns: defaultCols,
			generalCheckboxes: defaultGeneral,
			inputCheckboxes: defaultInput,
			outputCheckboxes: defaultOutput,
			windowWidth: 0,
			windowHeight: 0,
			copied: false
		};

		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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

		/* Add event listener for window resize. Helps with table formatting on small screens. */
		this.updateWindowDimensions();
		window.addEventListener('resize', this.updateWindowDimensions);
	}

	/* Called when the component is unmounted. Removes the event listener. */
	componentWillUnmount = () => {
		window.removeEventListener('resize', this.updateWindowDimensions);
	}

	/* Gets window dimensions. */
	updateWindowDimensions = () => {
		this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
		this.buildTableColumns();
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
			var tempTitle2 = [...this.state.jobHistory][0];

			tempTitle2 = Object.keys(tempTitle2.output)[j].replace(/([a-z])([A-Z])/g, '$1 $2');
			tempTitle2 = tempTitle2.charAt(0).toUpperCase() + tempTitle2.slice(1);

			if (Object.keys(this.state.jobHistory[0].output)[j] !== 'jobName')
				colList3.push(
					{
						label: tempTitle2,
						value: Object.keys(this.state.jobHistory[0].output)[j]
					},
				);
		}

		/* If window width is small, do 2 per row instead of 3 (helps with formatting). */
		var activeColSpan = 6;
		var colSpan = 8;

		if (this.state.windowWidth < 500) {
			activeColSpan = 12;
			colSpan = 12;
		}

		/* Build checkbox lists for each section. Helps with formatting. */
		var alwaysActiveCols = this.buildCheckboxes(colList1, 'general', activeColSpan, true);
		var jobInputCols = this.buildCheckboxes(colList2, 'input', colSpan);
		var jobOutputCols = this.buildCheckboxes(colList3, 'output', colSpan);

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

	/* Helper function to generate checkbox grids from a list of strings. */
	buildCheckboxes = (list, type, span, disabled = false) => {
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

	/* Holds values in each checkbox, updates immediately when a checkbox is clicked.
	 * Stores values temporarily before they are committed over to the selectedColumns state array. */
	onCheckboxChange = (checkedValues, type) => {
		switch (type) {
			case 'input':
				this.setState({ inputCheckboxes: checkedValues });
				break;
			default:
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

		cookies.set('defaultCols', temp, { path: '/', maxAge: 31536000 });
		cookies.set('defaultGeneral', generalCheckboxes, { path: '/', maxAge: 31536000 });
		cookies.set('defaultInput', inputCheckboxes, { path: '/', maxAge: 31536000 });
		cookies.set('defaultOutput', outputCheckboxes, { path: '/', maxAge: 31536000 });

		/* Set selected columns, rebuild table. */
		this.setState({
			selectedColumns: temp,
			columnModalVisible: false
		}, () => {
			this.buildTableColumns();
			this.buildTable();
		});
	}

	/* Builds the column structure of the table based on what columns have been selected. */
	buildTableColumns = () => {
		const { selectedColumns, jobHistory, windowWidth } = this.state;

		var tempCol = [];
		var tempWidth = 800;

		/* Add base columns that cannot be removed. */
		tempCol.push(
			{
				title: 'Job ID',
				dataIndex: 'jobID',
				width: 100,
				sortOrder: 'descend',
				sorter: (a, b) => a.jobID - b.jobID,
				fixed: windowWidth < 350 ? false : 'left'
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

				/* Check if value is number, boolean, or string. If number sort rows by number, if string sort rows by localecompare. */
				if ((typeof jobHistory[0].input[selectedColumns[i]] === 'number') || (typeof jobHistory[0].output[selectedColumns[i]] === 'number'))
					tempCol.push(
						{
							title: tempTitle,
							dataIndex: selectedColumns[i],
							width: 175,
							sorter: (a, b) => a[selectedColumns[i]] - b[selectedColumns[i]],
						},
					);
				else if ((typeof jobHistory[0].input[selectedColumns[i]] === 'boolean') || (typeof jobHistory[0].output[selectedColumns[i]] === 'boolean'))
					tempCol.push(
						{
							title: tempTitle,
							dataIndex: selectedColumns[i],
							width: 175,
							sorter: (a, b) => { return a[selectedColumns[i]].toString().localeCompare(b[selectedColumns[i]].toString()) },
							render: (text) => { return text.toString() }
						},
					);
				else
					tempCol.push(
						{
							title: tempTitle,
							dataIndex: selectedColumns[i],
							width: 175,
							sorter: (a, b) => { return a[selectedColumns[i]].localeCompare(b[selectedColumns[i]]) },
						},
					);

				tempWidth += 175;
			}
		}

		/* Add results columns that cannot be removed. */
		tempCol.push(
			{
				title: 'View',
				render: (text, row) => <Button className={windowWidth < 350 ? null : Style.resultsColumn} onClick={() => { setTimeout(() => { this.compareJobs([row.jobID]) }, 100) }}><Icon className={Style.buttonIcon} type="search" /></Button>,
				width: 65,
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
		var { justifications } = this.state;

		/* Get the data from the row in the table, organize it. */
		var spreadExportData = [];
		spreadExportData = BuildSpreadsheet(keys, this.state.jobHistory, justifications);

		var spreadsheetData = spreadExportData[0];
		var exportData = spreadExportData[1];
		var spreadsheetWidth = spreadExportData[2];

		/* Build the name of the file generated when the "Export to CSV" button is clicked.
		 * Also build the target URL for the 'Copy Link to Clipboard' button.*/
		var copyURL = window.location.href.split('job-history')[0];
		if (justifications)
			copyURL += 'job-results?justifications=true?IDs='
		else
			copyURL += 'job-results?justifications=false?IDs='

		var fileName = "";
		if (keys.length === 1)
			fileName = "Job";
		else
			fileName = "Compare_Jobs";

		for (let i = 0; i < keys.length; i++) {
			copyURL += keys[i];
			if (i !== keys.length - 1)
				copyURL += ",";

			fileName += "_" + keys[i];
		}

		fileName += ".csv";

		/* Build the ReactDataSheet component using the data returned from buildSpreadsheet(). */
		var modalInnards =
			<>
				<CSVLink data={exportData} filename={fileName}>
					<Button
						type="primary"
						style={{ marginBottom: 10, marginRight: 10, paddingLeft: 10, paddingRight: 10 }}
					>
						<Icon className={Style.buttonIcon} type="file-excel" />
						Export to CSV
					</Button>
				</CSVLink>
				<CopyToClipboard text={copyURL}>
					<Tooltip placement="top" trigger="focus" title="Copied!">
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
					style={{ marginLeft: spreadsheetWidth > 350 ? 10 : 0, marginBottom: 10 }}
					onChange={() => this.handleJustifications()}
					checked={justifications}
				>
					Justifications?
				</Checkbox>
				<div style={{ width: '100%', overflowX: 'scroll' }}>
					<div style={{ width: spreadsheetWidth }}>
						<ReactDataSheet
							data={spreadsheetData}
							valueRenderer={(cell) => <div style={{ textAlign: 'center' }}>{cell.value}</div>}
							onChange={() => { }}
						/>
					</div>
				</div>
			</>;

		this.setState({
			spreadsheetWidth: spreadExportData[2],
			spreadsheetModal: modalInnards,
			currentJobID: keys.length === 1 ? keys[0] : null
		})

		/* Open the modal and display the data. */
		this.toggleModal("spreadsheet");
	}

	/* Triggered when checkbox is clicked. Toggles justification column. */
	handleJustifications = async () => {
		this.toggleModal("spreadsheet");

		await this.setState({ justifications: !this.state.justifications });

		setTimeout(() => { this.compareJobs(this.state.selectedRowKeys); this.forceUpdate(); }, 300);
	}

	render() {
		const {
			tableData,
			tableColumns,
			tableWidth,
			spreadsheetWidth,
			spreadsheetModal,
			spreadsheetModalVisible,
			columnModal,
			columnModalVisible,
			selectedRowKeys,
			windowWidth
		} = this.state;

		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
			fixed: windowWidth < 350 ? null : 'left',
		};

		return (
			<Fragment>
				<h1>Job History</h1>

				{/* Button for column configuration. Separate from the others. */}
				<Button
					className={Style.settingsButton}
					onClick={() => {
						this.buildColumnChecklist();
						this.toggleModal("columns");
					}}
					type="default"
				>
					<Icon className={Style.buttonIcon} type="setting" />
					Columns
				</Button>

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
					width={spreadsheetWidth + 20}
					style={{ maxWidth: '95%' }}
					bodyStyle={{ padding: '10px' }}
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
					{selectedRowKeys.length > 1 ?
						<Button
							className={Style.tableButton}
							onClick={() => {
								this.setState({ justifications: !this.state.justifications }, () => this.compareJobs(selectedRowKeys));
							}}
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
							<span>{selectedRowKeys.length} selected</span>
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
					scroll={{ y: '60vh', x: tableWidth - 100 }}
					pagination={{ defaultPageSize: 10, showQuickJumper: true, showSizeChanger: true, pageSizeOptions: ['10', '20', '30'] }}
					size={windowWidth < 350 ? "small" : "large"}
					bordered
					onRow={(record, rowIndex) => {
						return {
							onClick: () => {
								var tempRowKeys = [...this.state.selectedRowKeys];

								if (tempRowKeys.indexOf(record.jobID) === -1)
									tempRowKeys.push(record.jobID)
								else
									tempRowKeys.splice(tempRowKeys.indexOf(record.jobID), 1);

								this.setState({ selectedRowKeys: tempRowKeys });
								this.forceUpdate();
							}
						}
					}}
				/>
			</Fragment>
		);
	}
}

export default withCookies(JobHistory);