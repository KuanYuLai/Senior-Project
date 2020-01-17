import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Button, Form, Table } from 'antd';
import moment from 'moment';

import Style from '../CSS/JobHistory.module.css'

export class JobHistory extends Component {
	constructor() {
		super();

		this.sampleColumns = [
			{
				title: 'Job #',
				dataIndex: 'jobNumber',
				width: 100,
				sorter: (a, b) => a.jobNumber - b.JobNumber,
			},
			{
				title: 'Date',
				dataIndex: 'date',
				width: 150,
                sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
				defaultSortOrder: 'descend',
            },
            {
                title: 'Link',
                dataIndex: 'link',
                render: text => <a href={'/' + text}>Link</a>,
            },
		];

		this.sampleData = [
			{
				jobNumber: 1,
                date: moment(new Date()).add(-20, 'days').format("MM-DD-YYYY"),
                link: '',
            },
            {
                jobNumber: 2,
                date: moment(new Date()).add(-15, 'days').format("MM-DD-YYYY"),
                link: '',
            },
            {
                jobNumber: 3,
                date: moment(new Date()).add(-10, 'days').format("MM-DD-YYYY"),
                link: '',
            },
            {
                jobNumber: 4,
                date: moment(new Date()).add(-5, 'days').format("MM-DD-YYYY"),
                link: '',
            },
            {
                jobNumber: 5,
                date: moment(new Date()).format("MM-DD-YYYY"),
                link: '',
            },
		]
	}

	render() {
		return (
			<Fragment>
				<h1>Job History</h1>
				<br />
                <Table
                    rowKey="jobNumber"
                    dataSource={this.sampleData}
                    columns={this.sampleColumns}
                    style={{ width: 350 }}
				/>
			</Fragment>
		);
	}
}