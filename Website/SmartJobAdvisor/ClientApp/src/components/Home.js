import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Button, Icon } from 'antd';

import Style from '../CSS/Home.module.css'

export const ServerURL = "http://ec2-52-27-132-187.us-west-2.compute.amazonaws.com:8080/"

export class Home extends Component {
    render() {
        let { callback } = this.props;

		return (
			<div className={Style.homePage}>
				<Icon component={() => (<img src={require('../Images/SJA-logo.svg')} height="250px" />)} />
				<br />
				<h3>What would you like to do?</h3>

				<div className={Style.buttonContainer}>
					<Button
						className={Style.button}
						onClick={() => callback('new-job', true)}
						type="primary"
					>
						<Icon className={Style.buttonIcon} type="plus" />
						Add New Job
					</Button>
					<Button
						className={Style.button}
						onClick={() => callback('job-history', true)}
						type="default"
					>
						<Icon className={Style.buttonIcon} type="history" />
						View History
					</Button>
				</div>
			</div>
		);
	}
}