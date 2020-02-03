import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Form, Icon, Input, InputNumber, Popconfirm, Radio, Row, Col, Select, Slider } from 'antd';

import Style from '../CSS/NewJob.module.css'

const { Option } = Select;

/* Function to convert a string to proper title case. */
String.prototype.toProperCase = function () {
	return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

class NewJobForm extends React.Component {
	constructor() {
		super();

		/* This will eventually be replaced with a call to a database.
		 * For now, this file exists locally. */
		var paperDatabase = require('../PaperData/SJA-paper-db-2020-01-20-trim.json');

		/* Initialize all values and populate radios/selects. */
		this.state = {
			unknownPaper: false,
			paperNameMfrDisabled: false,
			currentPaperNames: paperDatabase.paperdb,
			paperDatabase: paperDatabase.paperdb,
			coverageVal: 50,
			opticalDensity: 100,
			paperMfrDropdown: this.getMfrDropdown(paperDatabase.paperdb, "manufacturer"),
			paperNameDropdown: this.getMfrDropdown(paperDatabase.paperdb, "productname"),
			paperWeightRadio: this.getRadio(paperDatabase.paperdb, "weightclass"),
			paperTypeRadio: this.getRadio(paperDatabase.paperdb, "papertype"),
			paperSubTypeRadio: this.getRadio(paperDatabase.paperdb, "papersubtype"),
			paperFinishRadio: this.getRadio(paperDatabase.paperdb, "finish"),
		};
	};

	getRadio = (data, key, filter = null) => {
		// Create the select component
		var radio = [];

		var tempArray = data.map(function (e) { return e[key]; }).filter((v, i, a) => a.indexOf(v) === i);

		// Sort the list, except for weights
		if (key !== "weightclass")
			tempArray.sort();

		for (let i = 0; i < tempArray.length; i++) {
			var disabled = false;

			if (filter !== null) {
				if (filter.indexOf(tempArray[i]) === -1) {
					disabled = true;

					if (this.props.form.getFieldValue(key) === tempArray[i]) {
						this.props.form.resetFields(key);
						this.props.form.resetFields("manufacturer");
						this.props.form.resetFields("productname");
					}
						
				}
			}

			radio.push(<Radio.Button disabled={disabled} key={i} value={tempArray[i]}>{tempArray[i]}</Radio.Button>);
		}

		return radio;
	}

	setRadios = (selected) => {
		const { paperDatabase } = this.state;
		const { setFieldsValue } = this.props.form;

		var paperTypes = [];
		var paperSubTypes = [];
		var paperWeights = [];
		var paperFinishes = [];

		/* Grab all of the types/subtypes/weights/finishes within the list of objects. */
		for (let i = 0; i < selected.length; i++) {
			paperTypes.push(selected[i].papertype);
			paperSubTypes.push(selected[i].papersubtype);
			paperWeights.push(selected[i].weightclass);
			paperFinishes.push(selected[i].finish);
		}

		/* Filter the lists of types/subtypes/weights/finishes to remove duplicates. */
		paperTypes = paperTypes.filter((v, i, a) => a.indexOf(v) === i);
		paperSubTypes = paperSubTypes.filter((v, i, a) => a.indexOf(v) === i);
		paperWeights = paperWeights.filter((v, i, a) => a.indexOf(v) === i);
		paperFinishes = paperFinishes.filter((v, i, a) => a.indexOf(v) === i);

		/* If there's only one choice for a radio, just fill it out. */
		if (paperTypes.length === 1)
			setFieldsValue({ papertype: paperTypes[0] });
		if (paperSubTypes.length === 1)
			setFieldsValue({ papersubtype: paperSubTypes[0] });
		if (paperWeights.length === 1)
			setFieldsValue({ weightclass: paperWeights[0] });
		if (paperFinishes.length === 1)
			setFieldsValue({ finish: paperFinishes[0] });

		console.log(paperWeights);

		/* Update other radios. Once a choice has been made on a radio, all other options grey out. */
		this.setState({
			paperTypeRadio: this.getRadio(paperDatabase, "papertype", paperTypes),
			paperSubTypeRadio: this.getRadio(paperDatabase, "papersubtype", paperSubTypes),
			paperWeightRadio: this.getRadio(paperDatabase, "weightclass", paperWeights),
			paperFinishRadio: this.getRadio(paperDatabase, "finish", paperFinishes),
		});
	}

	getMfrDropdown = (data, key) => {
		// Create the select component
		var dropdown = [];
		var mfrNames = [];

		// Get all names
		for (let i = 0; i < data.length; i++) {
			mfrNames.push(data[i][key]);
		}

		// Filter list for unique names only, then sort it alphabetically
		mfrNames = mfrNames.filter((v, i, a) => a.indexOf(v) === i).sort();

		// Create the dropdown for the Select using the list of names
		for (let j = 0; j < mfrNames.length; j++) {
			dropdown.push(<Option key={mfrNames[j]}>{mfrNames[j]}</Option>);
		}

		return dropdown;

		/* This is an example of creating the options for a dropdown menu based off
		 * of data fetched via an API call. Leaving this here as an example.
		 * 
		// Fetch the degree table to get values for select component
		fetch(serverURL + "get_table/degree", {
			method: "GET",
			headers: {
				"Accept": "application/json"
			}
		}).then((res) => {
			res.json().then((data) => {
				// Create the select component
				var dropdown = [];

				for (let i = 0; i < data.length; i++) {
					var text = data[i].degreesID + " - " + data[i].degreeCombination;
					dropdown.push(<Option key={data[i].degreesID}>{text}</Option>);
				}
				this.setState({ degreeDropdown: dropdown })
			});
		}).catch(err => err);
		*/
	};

	/* Called when the coverage value is changed. */
	onCoverageValChange = val => {
		const { setFieldsValue } = this.props.form;

		setFieldsValue({
			maxCoverage: val,
		});

		this.setState({
			coverageVal: val,
		});
	};

	/* Called when the optical density value is changed. */
	onODValChange = val => {
		const { setFieldsValue } = this.props.form;

		// Set a minimum value
		if (val < 50)
			val = 50;

		setFieldsValue({
			opticalDensity: val,
		});

		this.setState({
			opticalDensity: val,
		});
	};

	onPaperMfrChange = val => {
		const { setFieldsValue, getFieldValue, resetFields } = this.props.form;

		var dropdown = [];
		var paperNames = [];

		/* Grab all instances that contain the manufacturer selected in the Mfr dropdown. */
		var selectedMfr = this.state.currentPaperNames.filter((e) => e.manufacturer === val);

		/* Grab all of the productnames within the list of objects. */
		for (let i = 0; i < selectedMfr.length; i++) {
			paperNames.push(selectedMfr[i].productname);
		}

		/* Filter the list of productnames to remove duplicates. */
		paperNames = paperNames.filter((v, i, a) => a.indexOf(v) === i);

		/* Check to see if currently selected paper name is a product of selected manufacturer.
		 * If it is, leave it, if it's not, clear it */
		if (paperNames.indexOf(getFieldValue("productname")) === -1)
			resetFields("productname");

		/* Create the paper name dropdown list using the filtered list of productnames. */
		for (let j = 0; j < paperNames.length; j++) {
			dropdown.push(<Option key={paperNames[j]}>{paperNames[j]}</Option>);
		}

		/* If there's only one product for the manufacturer, select is automatically. */
		if (paperNames.length === 1)
			setFieldsValue({
				productname: paperNames[0],
			});

		this.setRadios(selectedMfr);

		this.setState({
			paperNameDropdown: dropdown,
		});
	}

	/* Narrows down the paper selection radio buttons when a paper product is selected. */
	onPaperNameChange = val => {
		const { setFieldsValue } = this.props.form;

		var selectedPaper = this.state.paperDatabase.filter((e) => e.productname === val);

		/* Set the manufacturer's name. */
		setFieldsValue({
			manufacturer: selectedPaper[0].manufacturer,
		});

		this.setRadios(selectedPaper);
	};

	/* Called when a radio button is hit in paper selection. Narrows down mfr and product names, autofills once there is only one option. */
	checkPaperMfrName = (e, field) => {
		const { getFieldValue, setFieldsValue } = this.props.form;
		const { paperDatabase } = this.state;

		var currentPapers = [...paperDatabase];

		currentPapers = currentPapers.filter((a) => a[field] === e.target.value);

		if (typeof getFieldValue("manufacturer") !== 'undefined' && field !== "manufacturer")
			currentPapers = currentPapers.filter((a) => a.manufacturer === getFieldValue("manufacturer"));
		if (typeof getFieldValue("productname") !== 'undefined' && field !== "productname")
			currentPapers = currentPapers.filter((a) => a.productname === getFieldValue("productname"));
		if (typeof getFieldValue("papertype") !== 'undefined' && field !== "papertype")
			currentPapers = currentPapers.filter((a) => a.papertype === getFieldValue("papertype"));
		if (typeof getFieldValue("papersubtype") !== 'undefined' && field !== "papersubtype")
			currentPapers = currentPapers.filter((a) => a.papersubtype === getFieldValue("papersubtype"));
		if (typeof getFieldValue("weightclass") !== 'undefined' && field !== "weightclass")
			currentPapers = currentPapers.filter((a) => a.weightclass === getFieldValue("weightclass"));
		if (typeof getFieldValue("finish") !== 'undefined' && field !== "finish")
			currentPapers = currentPapers.filter((a) => a.finish === getFieldValue("finish"));

		var paperMfrs = [];
		var paperNames = [];

		/* Grab all of the types/subtypes/weights/finishes within the list of objects. */
		for (let i = 0; i < currentPapers.length; i++) {
			paperMfrs.push(currentPapers[i].manufacturer);
			paperNames.push(currentPapers[i].productname);
		}

		paperMfrs = [...new Set(paperMfrs)];
		paperNames = [...new Set(paperNames)];

		if (paperNames.length === 1)
			setFieldsValue({
				manufacturer: paperMfrs[0],
				productname: currentPapers[0].productname,
			});
		else if (paperMfrs.length === 1)
			setFieldsValue({
				manufacturer: paperMfrs[0],
			});

		this.setState({
			currentPaperNames: currentPapers,
			paperMfrDropdown: this.getMfrDropdown(currentPapers, "manufacturer"),
			paperNameDropdown: this.getMfrDropdown(currentPapers, "productname"),
		});

		this.setRadios(currentPapers);
	}

	handleUnknownPaper = () => {
		const { unknownPaper, paperNameMfrDisabled, paperDatabase } = this.state;

		this.props.form.resetFields(["manufacturer", "productname", "papertype", "papersubtype", "weightclass", "finish"]);
		this.setState({
			unknownPaper: !unknownPaper,
			paperNameMfrDisabled: !paperNameMfrDisabled,
			paperMfrDropdown: this.getMfrDropdown(paperDatabase, "manufacturer"),
			paperNameDropdown: this.getMfrDropdown(paperDatabase, "productname"),
		});

		this.resetPaperSelectionRadio();
	}

	/* Resets all the paper selection radio disabled values. */
	resetPaperSelectionRadio = () => {
		let { paperDatabase } = this.state;

		this.setState({
			paperTypeRadio: this.getRadio(paperDatabase, "papertype"),
			paperSubTypeRadio: this.getRadio(paperDatabase, "papersubtype"),
			paperWeightRadio: this.getRadio(paperDatabase, "weightclass"),
			paperFinishRadio: this.getRadio(paperDatabase, "finish"),
		});
	}

	/* Resets all form fields for paper selection. */
	paperReset = () => {
		this.props.form.resetFields(["manufacturer", "productname", "papertype", "papersubtype", "weightclass", "finish"]);
		this.resetPaperSelectionRadio();

		this.setState({
			paperMfrDropdown: this.getMfrDropdown(this.state.paperDatabase, "manufacturer"),
			paperNameDropdown: this.getMfrDropdown(this.state.paperDatabase, "productname"),
			currentPaperNames: this.state.paperDatabase,
		});
	}

	/* Resets the max coverage and optical density sliders. */
	sliderReset = () => {
		this.setState({
			coverageVal: 50,
			opticalDensity: 100,
		});
	}

	/* Resets the paper selection section. */
	infoReset = () => {
		this.props.form.resetFields(["jobName", "ruleset", "maxCoverage", "opticalDensity"]);
		this.setState({ unknownPaper: false });
		this.sliderReset();
	}

	/* Gathers and validates form data. */
	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);
			}
		});
	};

	render() {
		const { coverageVal, opticalDensity, paperNameMfrDisabled, unknownPaper } = this.state;
		const { getFieldDecorator } = this.props.form;

		const paperFormItemLayout = {
			labelCol: { span: 3 },
			wrapperCol: { span: 21 },
		}

		return (
			<div className={Style.newJobFormContainer}>
				<h1>New Job</h1>
				<p>
					Enter the settings for the job.<br />
					Click Submit to pass the settings to the rules engine.
				</p>

				<br />

				<Form layout="vertical" onSubmit={this.handleSubmit} className={Style.newJobForm}>
					<div className={Style.formGeneralInfo}>
						<div style={{ display: 'inline-block' }}>
							<h5>
								General Info
								<Button className={Style.resetButton} onClick={() => this.infoReset()} type="default" >
									<Icon style={{ position: 'relative', bottom: 3 }} type="undo" />
									Reset
								</Button>
							</h5>
						</div>
						<Row gutter={20}>
							<Col span={12}>
								<Form.Item label="Job Name:" style={{ marginBottom: -5 }}>
									{getFieldDecorator('jobName', {
										rules: [{ required: true, message: 'Please input a job name' }],
										initialValue: "Setting Advice",
									})(
										<Input
											className={Style.formItemInput}
											prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
										/>,
									)}
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item label="Ruleset:" style={{ marginBottom: -5 }}>
									{getFieldDecorator('ruleset', {
										rules: [{ required: true, message: 'Please choose a ruleset' }],
										initialValue: "Default",
									})(
										<Select className={Style.formItemInput}>
											<Option value="Default">Default</Option>
											<Option value="Ruleset B">Ruleset B</Option>
											<Option value="Ruleset C">Ruleset C</Option>
										</Select>
									)}
								</Form.Item>
							</Col>
						</Row>
						<Form.Item style={{ marginBottom: -5 }} label="PDF Max Coverage Percentage:">
							{getFieldDecorator('maxCoverage', {
								rules: [{ required: true, message: 'Please input max coverage' }],
								initialValue: 50,
							})(
								<div style={{ display: 'flex' }} >
									<Slider
										className={Style.formItemInput}
										style={{ width: 'calc(100% - 100px)' }}
										min={0}
										max={100}
										onChange={this.onCoverageValChange}
										value={typeof coverageVal === 'number' ? coverageVal : 0}
									/>
									<InputNumber
										className={Style.formItemInputNumber}
										style={{ width: 72 }}
										min={1}
										max={100}
										formatter={value => `${value}%`}
										value={coverageVal}
										onChange={this.onCoverageValChange}
									/>
								</div>
							)}
						</Form.Item>
						<Form.Item label="Optical Density:">
							{getFieldDecorator('opticalDensity', {
								rules: [{ required: true, message: 'Please input max coverage' }],
								initialValue: 50,
							})(
								<div style={{ display: 'flex' }} >
									<Slider
										className={Style.formItemInput}
										style={{ width: 'calc(100% - 100px)' }}
										step={5}
										min={0}
										max={100}
										onChange={this.onODValChange}
										value={typeof opticalDensity === 'number' ? opticalDensity : 0}
									/>
									<InputNumber
										className={Style.formItemInputNumber}
										style={{ width: 72 }}
										step={5}
										min={50}
										max={100}
										formatter={value => `${value}%`}
										value={opticalDensity}
										onChange={this.onODValChange}
									/>
								</div>
							)}
						</Form.Item>
					</div>

					<div style={{ display: 'inline-block' }}>
						<h5>
							Paper Selection
							<Button className={Style.resetButton} onClick={() => this.paperReset()} type="default" >
								<Icon style={{ position: 'relative', bottom: 3 }} type="undo" />
								Reset
							</Button>
							<Checkbox
								style={{ position: 'relative', bottom: 2 }}
								onChange={() => this.handleUnknownPaper()}
								checked={unknownPaper}
							>
								Unknown Paper?
							</Checkbox>
						</h5>
					</div>
					<Form.Item label="Mfr:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
						{getFieldDecorator('manufacturer', {
							rules: [{ required: !paperNameMfrDisabled, message: 'Please select a manufacturer' }],
						})(
							<Select
								className={Style.formItemPaper}
								style={{ maxWidth: 320 }}
								disabled={paperNameMfrDisabled}
								onChange={this.onPaperMfrChange}
								showSearch
								placeholder={
									paperNameMfrDisabled === true ? <span>Disabled</span>
									: <span><Icon type="search" className={Style.iconAdjust} />&nbsp;Select a product</span>
								}
							>
								{this.state.paperMfrDropdown}
							</Select>
						)}
					</Form.Item>
					<Form.Item label="Name:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
						{getFieldDecorator('productname', {
							rules: [{ required: !paperNameMfrDisabled, message: 'Please select a paper' }],
						})(
							<Select
								className={Style.formItemPaper}
								style={{ maxWidth: 320 }}
								disabled={paperNameMfrDisabled}
								onChange={this.onPaperNameChange}
								showSearch
								placeholder={
									paperNameMfrDisabled === true ? <span>Disabled</span>
										: <span><Icon type="search" className={Style.iconAdjust} />&nbsp;Select a manufacturer</span>
								}
							>
								{this.state.paperNameDropdown}
							</Select>
						)}
					</Form.Item>

					<Form.Item label="Type:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
						{getFieldDecorator('papertype', {
							rules: [{ required: true, message: 'Please choose a paper type' }],
						})(
							<Radio.Group
								className={Style.formItemPaper}
								onChange={(e) => {
									if (!paperNameMfrDisabled)
										this.checkPaperMfrName(e, "papertype");
								}}
							>
								{this.state.paperTypeRadio}
							</Radio.Group>
						)}
					</Form.Item>
					<Form.Item label="Sub-Type:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
						{getFieldDecorator('papersubtype')(
							<Radio.Group
								className={Style.formItemPaper}
								onChange={(e) => {
									if (!paperNameMfrDisabled)
										this.checkPaperMfrName(e, "papersubtype");
								}}
							>
								{this.state.paperSubTypeRadio}
							</Radio.Group>
						)}
					</Form.Item>
					<Form.Item label="Weight:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
						{getFieldDecorator('weightclass', {
							rules: [{ required: true, message: 'Please choose a weight class' }],
						})(
							<Radio.Group
								className={Style.formItemPaper}
								onChange={(e) => {
									if (!paperNameMfrDisabled)
										this.checkPaperMfrName(e, "weightclass");
								}}
							>
								{this.state.paperWeightRadio}
							</Radio.Group>
						)}
					</Form.Item>
					<Form.Item label="Finish:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
						{getFieldDecorator('finish', {
							rules: [{ required: true, message: 'Please choose a finish' }],
						})(
							<Radio.Group
								className={Style.formItemPaper}
								onChange={(e) => {
									if (!paperNameMfrDisabled)
										this.checkPaperMfrName(e, "finish");
								}}
							>
								{this.state.paperFinishRadio}
							</Radio.Group>
						)}
					</Form.Item>

					<br />

					<div className={Style.formButtons}>
						<Button type="primary" onClick={this.handleSubmit}>
							Submit
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

const NewJob = Form.create({ name: 'new-job' })(NewJobForm);

export { NewJob };