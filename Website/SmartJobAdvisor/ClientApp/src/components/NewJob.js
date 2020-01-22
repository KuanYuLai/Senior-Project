import React, { Component, Fragment } from 'react';
import { Button, Form, Icon, Input, InputNumber, Radio, Row, Col, Select, Slider } from 'antd';

import Style from '../CSS/NewJob.module.css'

const { Option } = Select;

class NewJobForm extends React.Component {
	state = {
		coverageVal: 50,
	};

	onCoverageValChange = val => {
		this.setState({
			coverageVal: val,
		});
	};

	onPaperNameChange = val => {
		const { setFieldsValue, getFieldValue } = this.props.form;

		if (val === "Paper A") {
			setFieldsValue({
				paperSurface: "Coated",
				paperWeight: "Heavy",
				paperFinish: "Gloss",
			});
		}
		else if (val === "Paper B") {
			setFieldsValue({
				paperSurface: "Uncoated",
				paperWeight: "Light",
				paperFinish: "Silk",
			});
		}
		else if (val === "Paper C") {
			setFieldsValue({
				paperSurface: "Coated",
				paperWeight: "Medium",
				paperFinish: "Satin",
			});
		}
	};

	resetPaperName = () => {
		const { setFieldsValue, getFieldValue } = this.props.form;

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
		const { coverageVal } = this.state;
		const { getFieldDecorator } = this.props.form;

		const paperFormItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 14 },
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
					<h5>General Info</h5>
					<Row gutter={12}>
						<Col span={12}>
							<Form.Item label="Job Name">
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
						<Col span={12}>
							<Form.Item label="Ruleset">
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
							rules: [{ required: true, message: 'Please input your Password!' }],
						})(
							<Row>
								<Col span={12}>
									<Slider
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
						<Form.Item label="Name:" {...paperFormItemLayout} style={{ marginBottom: 0, marginTop: 20 }}>
							{getFieldDecorator('paperName')(
								<Select className={Style.formItemPaper} onChange={this.onPaperNameChange} placeholder="Select a paper or fill out data manually">
									<Option value="Paper A">Paper A</Option>
									<Option value="Paper B">Paper B</Option>
									<Option value="Paper C">Paper C</Option>
								</Select>
							)}
						</Form.Item>
						<Form.Item label="Surface:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('paperSurface', {
								rules: [{ required: true, message: 'Please choose a surface type' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									<Radio.Button value="Coated">Coated</Radio.Button>
									<Radio.Button value="Uncoated">Uncoated</Radio.Button>
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Weight:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('paperWeight', {
								rules: [{ required: true, message: 'Please choose a weight' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									<Radio.Button value="Light">Light</Radio.Button>
									<Radio.Button value="Medium">Medium</Radio.Button>
									<Radio.Button value="Heavy">Heavy</Radio.Button>
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item label="Finish:" {...paperFormItemLayout} style={{ marginBottom: 0 }}>
							{getFieldDecorator('paperFinish', {
								rules: [{ required: true, message: 'Please choose a finish' }],
							})(
								<Radio.Group className={Style.formItemPaper} onChange={this.resetPaperName}>
									<Radio.Button value="Matte">Matte</Radio.Button>
									<Radio.Button value="Gloss">Gloss</Radio.Button>
									<Radio.Button value="Satin">Satin</Radio.Button>
									<Radio.Button value="Silk">Silk</Radio.Button>
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