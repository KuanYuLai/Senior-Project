import React, { Component, Fragment } from 'react';
import { Button, Form, Icon, Input, InputNumber, Radio, Row, Col, Select, Slider } from 'antd';

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

		this.state = {
			paperDatabase: paperDatabase.paperdb,
			coverageVal: 50,
			paperNameDropdown: this.getDropdown(paperDatabase.paperdb, "productname"),
			paperWeightRadio: this.getRadio(paperDatabase.paperdb, "weightclass"),
			paperTypeRadio: this.getRadio(paperDatabase.paperdb, "papertype"),
			paperSubTypeRadio: this.getRadio(paperDatabase.paperdb, "papersubtype"),
			paperFinishRadio: this.getRadio(paperDatabase.paperdb, "finish"),
		};

		this.getRadio(paperDatabase.paperdb, 'manufacturer');
	};

	getRadio = (data, key) => {
		// Create the select component
		var radio = [];

		var tempArray = data.map(function (e) { return e[key]; }).filter((v, i, a) => a.indexOf(v) === i);

		for (let i = 0; i < tempArray.length; i++) {
			var text = tempArray[i].toProperCase();
			radio.push(<Radio.Button key={i} value={text}>{text}</Radio.Button>);
		}

		return radio;
	}

	getDropdown = (data, key) => {
		// Create the select component
		var dropdown = [];

		for (let i = 0; i < data.length; i++) {
			var text = data[i][key].toProperCase();
			dropdown.push(<Option key={text}>{text}</Option>);
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
		this.setState({
			coverageVal: val,
		});
	};

	onPaperNameChange = val => {
		const { setFieldsValue } = this.props.form;

		var selectedPaper = this.state.paperDatabase.filter((e) => e.productname === val)[0];

		setFieldsValue({
			productname: selectedPaper.productname.toProperCase(),
			manufacturer: selectedPaper.manufacturer.toProperCase(),
			weightclass: selectedPaper.weightclass.toProperCase(),
			papertype: selectedPaper.papertype.toProperCase(),
			papersubtype: selectedPaper.papersubtype.toProperCase(),
			finish: selectedPaper.finish.toProperCase(),
			useprimer: selectedPaper.useprimer.toProperCase(),
			usefixer: selectedPaper.usefixer.toProperCase(),
		});
	};

	resetPaperName = () => {
		const { setFieldsValue } = this.props.form;

		setFieldsValue({
			paperName: undefined,
		});
	}

	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);
			}
		});
	};

	render() {
		const { coverageVal, paperManufacturer } = this.state;
		const { getFieldDecorator, getFieldsValue } = this.props.form;

		const paperFormItemLayout = {
			labelCol: { span: 2 },
			wrapperCol: { span: 22 },
		}

		const paperFormItemLayoutName = {
			labelCol: { span: 3 },
			wrapperCol: { span: 21 },
		}

		console.log(this.state.paperDatabase);

		return (
			<div className={Style.newJobFormContainer}>
				<h1>New Job</h1>
				<p>
					Enter the settings for the job.<br />
					Click Submit to pass the settings to the rules engine.
				</p>

				<br />

				<Form layout="vertical" onSubmit={this.handleSubmit} className={Style.newJobForm}>
					<h5>General Info</h5>
					<Row gutter={12}>
						<Col span={8}>
							<Form.Item label="Job Name" style={{ marginBottom: 10 }}>
								{getFieldDecorator('jobName', {
									rules: [{ required: true, message: 'Please input a job name' }],
									initialValue: "Setting Advice",
								})(
									<Input
										prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
									/>,
								)}
							</Form.Item>
						</Col>
						<Col span={7}>
							<Form.Item label="Ruleset" style={{ marginBottom: 10 }}>
								{getFieldDecorator('ruleset', {
									rules: [{ required: true, message: 'Please choose a ruleset' }],
									initialValue: "Default",
								})(
									<Select>
										<Option value="Default">Default</Option>
										<Option value="Ruleset B">Ruleset B</Option>
										<Option value="Ruleset C">Ruleset C</Option>
									</Select>
								)}
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label="PDF Max Coverage Percentage">
						{getFieldDecorator('maxCoverage', {
							rules: [{ required: true, message: 'Please input max coverage' }],
						})(
							<Row>
								<Col span={12}>
									<Slider
										className={Style.formItemPaper}
										min={1}
										max={100}
										onChange={this.onCoverageValChange}
										value={typeof coverageVal === 'number' ? coverageVal : 0}
									/>
								</Col>
								<Col span={4}>
									<InputNumber
										min={1}
										max={100}
										formatter={value => `${value}%`}
										style={{ marginLeft: 16 }}
										value={coverageVal}
										onChange={this.onCoverageValChange}
									/>
								</Col>
							</Row>
						)}
					</Form.Item>

					<h5>Paper Type</h5>
					<div style={{ marginLeft: 30 }}>
						<Row gutter={12}>
							<Col span={16}>
								<Form.Item label="Name:" {...paperFormItemLayoutName} style={{ marginBottom: 0 }}>
									{getFieldDecorator('productname')(
										<Select className={Style.formItemPaper} onChange={this.onPaperNameChange} placeholder="Select a paper or fill out data manually">
											{this.state.paperNameDropdown}
										</Select>
									)}
								</Form.Item>
							</Col>
							<Col span={8}>
								<Form.Item label="Mfr:" {...paperFormItemLayoutName} style={{ marginBottom: 0 }}>
									{getFieldDecorator('manufacturer')(
										<Input className={Style.formItemPaper} readOnly placeholder="(autofilled)" />
									)}
								</Form.Item>
							</Col>
						</Row>

						<Form.Item label="Type:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('papertype', {
								rules: [{ required: true, message: 'Please choose a paper type' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									{this.state.paperTypeRadio}
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Sub-Type:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('papersubtype')(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									{this.state.paperSubTypeRadio}
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Weight:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('weightclass', {
								rules: [{ required: true, message: 'Please choose a weight class' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									{this.state.paperWeightRadio}
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Finish:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('finish', {
								rules: [{ required: true, message: 'Please choose a finish' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									{this.state.paperFinishRadio}
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Primer:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('useprimer', {
								rules: [{ required: true, message: 'Please indicate primer use' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									<Radio.Button value="True">True</Radio.Button>
									<Radio.Button value="False">False</Radio.Button>
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Fixer:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('usefixer', {
								rules: [{ required: true, message: 'Please indicate fixer use' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									<Radio.Button value="True">True</Radio.Button>
									<Radio.Button value="False">False</Radio.Button>
								</Radio.Group>
							)}
						</Form.Item>
					</div>
					<br />
					<Form.Item>
						<Button type="primary">
							Submit
						</Button>
					</Form.Item>
				</Form>
			</div>
		);
	}
}

const NewJob = Form.create({ name: 'new-job' })(NewJobForm);

export { NewJob };