import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Form, Icon, Input, InputNumber, notification, Radio, Row, Col, Select, Slider } from 'antd';

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

		/* Initialize all values and populate radios/selects. */
		this.state = {
			unknownPaper: false,
			paperNameMfrDisabled: false,
			weightgsm: null,
			maxCoverage: 50,
			opticalDensity: 100,
		};
	};

	/* Runs before the constructor. */
	componentDidMount = async () => {
		/* Fetch the paper database from the server. Wait unfil fetch is complete to continue. */
		await this.fetchPaperDatabase();

		/* If there was an error fetching the paper database, don't attempt to populat dropdowns/radios. */
		if (typeof this.state.error === 'undefined' && this.state.error !== true) {
			this.setState({
				currentPaperNames: this.state.paperDatabase,
				paperMfrDropdown: this.getDropdown(this.state.paperDatabase, "manufacturer"),
				paperNameDropdown: this.getDropdown(this.state.paperDatabase, "productname"),
				paperWeightDropdown: this.getDropdown(this.state.paperDatabase, "weightgsm"),
				paperTypeRadio: this.getRadio(this.state.paperDatabase, "papertype"),
				paperSubTypeRadio: this.getRadio(this.state.paperDatabase, "papersubtype"),
				paperFinishRadio: this.getRadio(this.state.paperDatabase, "finish"),
			});
		}
	}

	/* Fetch the paper database from the server. */
	fetchPaperDatabase = async () => {
		/* Call database to request paperDatabase object. */
		await fetch(ServerURL + "paper-db/", {
			method: "GET",
			mode: 'cors',
			headers: {
				'Accept': 'application/json',
			}
		}).then(async (res) => {
			await res.json().then((data) => {
				this.setState({ paperDatabase: data.paperdb });

				// Testing with actual data
				//var data = require('../PaperData/HP-paper-db-CONFIDENTIAL-2020-02-09.json');
				//this.setState({ paperDatabase: data.paperdb })
			});
		}).catch(err => {
			this.fetchError("fetch paper database");
		});
	}

	/* Populate a Select component. */
	getDropdown = (data, key) => {
		/* Initialize the arrays to hold values scraped from data source and Select component Options. */
		var vals = [];
		var dropdown = [];

		/* A bit different for weightgsm, since it needs to be floats instead of strings. */
		if (key === "weightgsm")
			vals = data.map((obj) => { return parseFloat(obj.weightgsm) }).sort((a, b) => { return a - b });
		else
			vals = data.map((obj) => { return obj[key] }).sort();

		/* Filter the array for duplicates. */
		vals = [...new Set(vals)];

		/* Create the dropdown for the Select using the list of names. */
		for (let i = 0; i < vals.length; i++) {
			dropdown.push(<Option key={vals[i]}>{vals[i]}</Option>);
		}

		return dropdown;
	};

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
		var paperWeights = [];

		/* Grab all of the types/subtypes/weights/finishes within the list of objects. */
		for (let i = 0; i < selected.length; i++) {
			paperTypes.push(selected[i].papertype);
			paperSubTypes.push(selected[i].papersubtype);
			paperFinishes.push(selected[i].finish);
			paperWeights.push(parseFloat(selected[i].weightgsm));
		}

		/* Filter the lists of types/subtypes/weights/finishes to remove duplicates. */
		paperTypes = paperTypes.filter((v, i, a) => a.indexOf(v) === i);
		paperSubTypes = paperSubTypes.filter((v, i, a) => a.indexOf(v) === i);
		paperFinishes = paperFinishes.filter((v, i, a) => a.indexOf(v) === i);
		paperWeights = paperWeights.filter((v, i, a) => a.indexOf(v) === i);

		/* If there's only one choice for a radio, just fill it out. */
		var temp = null;
		if (paperTypes.length === 1)
			setFieldsValue({ papertype: paperTypes[0] });
		if (paperSubTypes.length === 1)
			setFieldsValue({ papersubtype: paperSubTypes[0] });
		if (paperFinishes.length === 1)
			setFieldsValue({ finish: paperFinishes[0] });
		if (paperWeights.length === 1) {
			setFieldsValue({ weightgsm: paperWeights[0] });
			this.setState({ weightgsm: paperWeights[0] });
		}

		/* Set the weightgsm dropdown values. */
		var dropdown = [];
		for (let i = 0; i < paperWeights.length; i++) {
			dropdown.push(<Option key={paperWeights[i]}>{paperWeights[i]}</Option>);
		}

		/* Update other radios. Once a choice has been made on a radio, all other options grey out. */
		this.setState({
			paperTypeRadio: this.getRadio(paperDatabase, "papertype", paperTypes),
			paperSubTypeRadio: this.getRadio(paperDatabase, "papersubtype", paperSubTypes),
			paperFinishRadio: this.getRadio(paperDatabase, "finish", paperFinishes),
			paperWeightDropdown: dropdown
		});
	}

	/* Called when a radio button is hit in paper selection. Narrows down mfr and product names, autofills once there is only one option. */
	checkPaperMfrName = (e, field) => {
		const { getFieldValue, setFieldsValue, getFieldsValue } = this.props.form;
		const { paperDatabase, currentPaperNames } = this.state;

		//var currentPapers = [...paperDatabase];
		var currentPapers = [...currentPaperNames];

		if (field !== "weightgsm") {
			setFieldsValue({
				[field]: e.target.value
			})
			currentPapers = currentPapers.filter((a) => a[field] === e.target.value);
		}
		else {
			this.setState({ weightgsm: e });
			setFieldsValue({
				[field]: e
			})
			currentPapers = currentPapers.filter((a) => a[field] === e);
		}

		if (typeof getFieldValue("manufacturer") !== 'undefined' && field !== "manufacturer")
			currentPapers = currentPapers.filter((a) => a.manufacturer == getFieldValue("manufacturer"));
		if (typeof getFieldValue("productname") !== 'undefined' && field !== "productname")
			currentPapers = currentPapers.filter((a) => a.productname == getFieldValue("productname"));
		if (typeof getFieldValue("papertype") !== 'undefined' && field !== "papertype")
			currentPapers = currentPapers.filter((a) => a.papertype == getFieldValue("papertype"));
		if (typeof getFieldValue("papersubtype") !== 'undefined' && field !== "papersubtype")
			currentPapers = currentPapers.filter((a) => a.papersubtype == getFieldValue("papersubtype"));
		if (typeof getFieldValue("weightgsm") !== 'undefined' && getFieldValue("weightgsm") !== null && field !== "weightgsm")
			currentPapers = currentPapers.filter((a) => a.weightgsm == getFieldValue("weightgsm"));
		if (typeof getFieldValue("finish") !== 'undefined' && field !== "finish")
			currentPapers = currentPapers.filter((a) => a.finish == getFieldValue("finish"));

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
			paperMfrDropdown: this.getDropdown(currentPapers, "manufacturer"),
			paperNameDropdown: this.getDropdown(currentPapers, "productname"),
			paperWeightDropdown: this.getDropdown(currentPapers, "weightgsm")
		});

		this.setRadios(currentPapers);
	}

	/* Called when the optical density value is changed. */
	onSliderChange = (val, field) => {
		const { setFieldsValue } = this.props.form;

		/* Set a minimum value, but only for opticalDensity slider. */
		if (val < 50 && field === "opticalDensity")
			val = 50;

		setFieldsValue({ [field]: val });
		this.setState({ [field]: val });
	};

	/* Called when the paper manufacturer is changed.
	 * Repopulates paper names dropdown with papers made by the selected manufacturer. */
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
		 * If it is, leave it, if it's not, clear it. */
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

	handleUnknownPaper = () => {
		const { unknownPaper, paperNameMfrDisabled } = this.state;

		this.setState({
			unknownPaper: !unknownPaper,
			paperNameMfrDisabled: !paperNameMfrDisabled,
		});

		/* Putting a timeout here fixes a weird bug where the "weightgsm" field decorator gets deleted. */
		setTimeout(() => {
			this.paperReset();
		}, 100);
		
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
		const { paperDatabase } = this.state;

		this.props.form.resetFields(["manufacturer", "productname", "papertype", "papersubtype", "weightgsm", "finish"]);
		this.resetPaperSelectionRadio();

		this.setState({
			paperMfrDropdown: this.getDropdown(paperDatabase, "manufacturer"),
			paperNameDropdown: this.getDropdown(paperDatabase, "productname"),
			paperWeightDropdown: this.getDropdown(paperDatabase, "weightgsm"),
			currentPaperNames: paperDatabase,
			weightgsm: null,
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

	/* Gathers and validates form data, then makes a POST call to the rules engine. */
	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields(async (err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);

				/* Call database to request paperDatabase object. */
				await fetch(ServerURL + 'new-job/', {
					method: 'POST',
					mode: 'cors',
					body: JSON.stringify(values),
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					}
				}).then(async (res) => {
					await res.json().then((data) => {
						console.log(data);
					});
				}).catch(() => {
					this.fetchError("submit job");
				});
			}
		});
	};

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
								showArrow={false}
								placeholder={
									paperNameMfrDisabled === true ? <span>Disabled</span>
									: <span><Icon type="search" className={Style.iconAdjust} />&nbsp;Select manufacturer</span>
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
								showArrow={false}
								placeholder={
									paperNameMfrDisabled === true ? <span>Disabled</span>
										: <span><Icon type="search" className={Style.iconAdjust} />&nbsp;Select paper</span>
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
							rules: [{ required: true, message: 'Please choose a weight in gsm' }],
							initialValue: weightgsm || null
						})(
							unknownPaper ?
								<div style={{ display: 'flex', marginBottom: '-20px' }} >
									<Slider
										className={Style.formItemInput}
										style={{ width: 'calc(100% - 127px)' }}
										min={0}
										max={500}
										value={weightgsm || 0}
										onChange={(e) => this.onSliderChange(e, "weightgsm")}
									/>
									<BetterInputNumber
										addonAfter="gsm"
										value={weightgsm || null}
										field="weightgsm"
										onSliderChange={this.onSliderChange}
									/>
								</div>
								:
								<>
									<Select
										className={Style.formItemPaper}
										style={{ maxWidth: 80 }}
										showSearch
										showArrow={false}
										onChange={(e) => this.checkPaperMfrName(e, "weightgsm")}
										placeholder={<span>Weight</span>}
										value={weightgsm || undefined}
									>
										{this.state.paperWeightDropdown}
									</Select>
									<div className="ant-input-group-addon" style={{ position: 'relative', borderBottomLeftRadius: 2, borderTopLeftRadius: 2, bottom: 6, paddingTop: '2px', verticalAlign: 'middle', display: 'inline-table', lineHeight: '24px', height: '32px' }}>gsm</div>
								</>
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