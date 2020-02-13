import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Form, Icon, Input, InputNumber, Popconfirm, Radio, Row, Col, Select, Slider } from 'antd';

import Style from '../CSS/NewJob.module.css'
import { ServerURL } from './Home';

const { Option } = Select;

class BetterInputNumber extends React.Component {
	render() {
		if (this.props.addonAfter) {
			return (
				<div className={Style.formItemInputNumber} style={{ display: 'flex', marginLeft: -10 }}>
					<InputNumber
						{...this.props}
						style={{ verticalAlign: 'middle', borderBottomRightRadius: 0, borderTopRightRadius: 0, width: 60 }}
						value={this.props.value}
						onChange={(e) => this.props.onSliderChange(e, this.props.field)}
					/>
					<div className="ant-input-group-addon" style={{ paddingTop: '2px', verticalAlign: 'middle', display: 'inline-table', lineHeight: '24px', height: '32px' }}>{this.props.addonAfter}</div>
				</div>
			);
		} else {
			return (
				<InputNumber {...this.props} />
			);
		}
	}
}

class NewJobForm extends React.Component {
	constructor() {
		super();

		/* This will eventually be replaced with a call to a database.
		 * For now, this file exists locally. */
		var paperDatabase = require('../PaperData/SJA-paper-db-2020-02-09-trim.json');

		/* Call database to request paperDatabase object. */
		fetch(ServerURL + "rules/SJA-paper-db-2020-02-09-trim.json", {
			method: "GET",
			mode: 'no-cors',
			headers: {
				"Accept": "application/json"
			}
		}).then((res) => {
			res.json().then((data) => {
				console.log(data);
			});
		}).catch(err => err);


		/* Initialize all values and populate radios/selects. */
		this.state = {
			unknownPaper: false,
			paperNameMfrDisabled: false,
			currentPaperNames: paperDatabase.paperdb,
			paperDatabase: paperDatabase.paperdb,
			weightgsm: 150,
			maxCoverage: 50,
			opticalDensity: 100,
			paperMfrDropdown: this.getMfrDropdown(paperDatabase.paperdb, "manufacturer"),
			paperNameDropdown: this.getMfrDropdown(paperDatabase.paperdb, "productname"),
			paperWeightDropdown: this.getWeightDropdown(paperDatabase.paperdb),
			paperTypeRadio: this.getRadio(paperDatabase.paperdb, "papertype"),
			paperSubTypeRadio: this.getRadio(paperDatabase.paperdb, "papersubtype"),
			paperFinishRadio: this.getRadio(paperDatabase.paperdb, "finish"),
		};
	};

	getWeightDropdown = (data) => {
		/* Get all weights, sort them in ascending order, then filter for duplicates. */
		var weightArray = data.map((obj) => { return parseFloat(obj.weightgsm) }).sort((a, b) => { return a - b });
		weightArray = [...new Set(weightArray)];

		this.weightMarks = {};
		for (let i = 0; i < weightArray.length; i++) {
			this.weightMarks[weightArray[i]] = "";
		}
	}

	/* Get the values for the radio group. */
	getRadio = (data, key, filter = null) => {
		var radio = [];

		/* Filter data based on supplied filters, then sort it. */
		var tempArray = data.map(function (e) { return e[key]; }).filter((v, i, a) => a.indexOf(v) === i).sort();

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

	/* Autofill radio values / grey out invalid values for selected paper/manufacturer. */
	setRadios = (selected) => {
		const { paperDatabase } = this.state;
		const { setFieldsValue } = this.props.form;

		var paperTypes = [];
		var paperSubTypes = [];
		var paperFinishes = [];

		/* Grab all of the types/subtypes/weights/finishes within the list of objects. */
		for (let i = 0; i < selected.length; i++) {
			paperTypes.push(selected[i].papertype);
			paperSubTypes.push(selected[i].papersubtype);
			paperFinishes.push(selected[i].finish);
		}

		/* Filter the lists of types/subtypes/weights/finishes to remove duplicates. */
		paperTypes = paperTypes.filter((v, i, a) => a.indexOf(v) === i);
		paperSubTypes = paperSubTypes.filter((v, i, a) => a.indexOf(v) === i);
		paperFinishes = paperFinishes.filter((v, i, a) => a.indexOf(v) === i);

		/* If there's only one choice for a radio, just fill it out. */
		if (paperTypes.length === 1)
			setFieldsValue({ papertype: paperTypes[0] });
		if (paperSubTypes.length === 1)
			setFieldsValue({ papersubtype: paperSubTypes[0] });
		if (paperFinishes.length === 1)
			setFieldsValue({ finish: paperFinishes[0] });

		/* Update other radios. Once a choice has been made on a radio, all other options grey out. */
		this.setState({
			paperTypeRadio: this.getRadio(paperDatabase, "papertype", paperTypes),
			paperSubTypeRadio: this.getRadio(paperDatabase, "papersubtype", paperSubTypes),
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
	};

	/* Called when the optical density value is changed. */
	onSliderChange = (val, field) => {
		const { setFieldsValue } = this.props.form;

		/* Set a minimum value, but only for opticalDensity slider*/
		if (val < 50 && field === "opticalDensity")
			val = 50;

		setFieldsValue({ [field]: val });
		this.setState({ [field]: val });
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
		if (typeof getFieldValue("weightgsm") !== 'undefined' && field !== "weightgsm")
			currentPapers = currentPapers.filter((a) => a.weightgsm === getFieldValue("weightgsm"));
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

		this.props.form.resetFields(["manufacturer", "productname", "papertype", "papersubtype", "weightgsm", "finish"]);
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
			paperFinishRadio: this.getRadio(paperDatabase, "finish"),
		});
	}

	/* Resets all form fields for paper selection. */
	paperReset = () => {
		this.props.form.resetFields(["manufacturer", "productname", "papertype", "papersubtype", "weightgsm", "finish"]);
		this.resetPaperSelectionRadio();

		this.setState({
			paperMfrDropdown: this.getMfrDropdown(this.state.paperDatabase, "manufacturer"),
			paperNameDropdown: this.getMfrDropdown(this.state.paperDatabase, "productname"),
			currentPaperNames: this.state.paperDatabase,
		});
	}

	/* Resets the paper selection section. */
	infoReset = () => {
		this.props.form.resetFields(["jobName", "ruleset", "maxCoverage", "opticalDensity"]);
		this.setState({
			unknownPaper: false,
			maxCoverage: 50,
			opticalDensity: 100,
		});
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
		const {
			weightgsm,
			maxCoverage,
			opticalDensity,
			paperNameMfrDisabled,
			unknownPaper
		} = this.state;
		const { getFieldDecorator } = this.props.form;

		/* Some formatting to change the form layout when the width of the window is < 575px. */
		const paperFormItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 4 },
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 20 },
			},
		}

		console.log(ServerURL);

		return (
			<div className={Style.newJobFormContainer}>
				<h1>New Job</h1>
				<br />
				<Form layout="vertical" onSubmit={this.handleSubmit} className={Style.newJobForm}>
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
					<Row gutter={20}>
						<Col span={12}>
							<Form.Item label="Quality Mode:" style={{ marginBottom: -5 }}>
								{getFieldDecorator('qualityMode', {
									rules: [{ required: true }],
									initialValue: "Quality",
								})(
									<Radio.Group className={Style.formItemPaper}>
										<Radio.Button value="Quality">Quality</Radio.Button>
										<Radio.Button value="Performance">Performance</Radio.Button>
									</Radio.Group>
								)}
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label="Press Unwinder Brand:" style={{ marginBottom: -5 }}>
								{getFieldDecorator('pressUnwinderBrand', {
									rules: [{ required: true }],
									initialValue: "EMT",
								})(
									<Radio.Group className={Style.formItemPaper}>
										<Radio.Button value="EMT">EMT</Radio.Button>
										<Radio.Button value="HNK">HNK</Radio.Button>
									</Radio.Group>
								)}
							</Form.Item>
						</Col>
					</Row>
					<Form.Item style={{ marginBottom: -5 }} label="PDF Max Coverage:">
						{getFieldDecorator('maxCoverage', {
							rules: [{ required: true }],
							initialValue: 50,
						})(
							<div style={{ display: 'flex', marginBottom: '-10px' }} >
								<Slider
									className={Style.formItemInput}
									style={{ width: 'calc(100% - 112px)' }}
									min={0}
									max={100}
									onChange={(e) => this.onSliderChange(e, "maxCoverage")}
									value={maxCoverage}
								/>
								<BetterInputNumber
									addonAfter="%"
									value={maxCoverage}
									field="maxCoverage"
									onSliderChange={this.onSliderChange}
								/>
							</div>
						)}
					</Form.Item>
					<Form.Item label="Optical Density:">
						{getFieldDecorator('opticalDensity', {
							rules: [{ required: true }],
							initialValue: 100,
						})(
							<div style={{ display: 'flex', marginBottom: '-10px' }} >
								<Slider
									className={Style.formItemInput}
									style={{ width: 'calc(100% - 112px)' }}
									step={5}
									min={0}
									max={100}
									onChange={(e) => this.onSliderChange(e, "opticalDensity")}
									value={opticalDensity}
								/>
								<BetterInputNumber
									addonAfter="%"
									value={opticalDensity}
									field="opticalDensity"
									onSliderChange={this.onSliderChange}
								/>
							</div>
						)}
					</Form.Item>

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
										: <span><Icon type="search" className={Style.iconAdjust} />&nbsp;Select a paper</span>
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
						{getFieldDecorator('weightgsm', {
							rules: [{ required: true, message: 'Please choose a weight class' }],
						})(
							unknownPaper ?
								<span>meme</span>
								:
								<div style={{ display: 'flex', marginBottom: '-20px' }} >
									<Slider
										className={Style.formItemInput}
										style={{ width: 'calc(100% - 127px)' }}
										min={0}
										max={500}
										value={weightgsm}
										onChange={(e) => this.onSliderChange(e, "weightgsm")}
									/>
									<BetterInputNumber
										addonAfter="gsm"
										value={weightgsm}
										field="weightgsm"
										onSliderChange={this.onSliderChange}
									/>
								</div>
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