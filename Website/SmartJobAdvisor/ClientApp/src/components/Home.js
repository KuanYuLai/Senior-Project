import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { Redirect } from 'react-router';

import Style from '../CSS/Home.module.css'

export const ServerURL = "http://ec2-18-220-128-176.us-east-2.compute.amazonaws.com:8000/"

export class Home extends Component {
	state = {
		redirectTarget: '',
		redirect: false,
	};

	render() {
		let { redirect, redirectTarget } = this.state;
        let { callback } = this.props;

		if (redirect === true) {
			redirect = false;
			return <Redirect push to={redirectTarget} />;
		}

		return (
			<div className={Style.homePage}>
				<Icon component={() => (
					<img
						src={require('../Images/SJA-logo.svg')}
						height="250px"
						alt="Smart Job Advisor"
					/>
				)} />
				<br />
				<h3>What would you like to do?</h3>

				<div className={Style.buttonContainer}>
					<Button
						className={Style.button}
						onClick={() => {
							callback('new-job');
							this.setState({ redirect: true, redirectTarget: "/new-job" })
						}}
						type="primary"
					>
						<Icon className={Style.buttonIcon} type="plus" />
						Add New Job
					</Button>
					<Button
						className={Style.button}
						onClick={() => {
							callback('job-history');
							this.setState({ redirect: true, redirectTarget: "/job-history" })
						}}
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