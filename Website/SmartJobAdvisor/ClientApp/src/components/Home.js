import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { Redirect } from 'react-router';

import Style from '../CSS/Home.module.css'

/* The URL of the SJA engine. Passed to all child components to allow API calls to be made. */
export const ServerURL = "http://ec2-18-220-128-176.us-east-2.compute.amazonaws.com:8000/"

/* The homepage of the site. Provides users links to the New Job form and the Job History page. */
export class Home extends Component {
	/* Initialize state variables:
	 *   - 'redirectTarget' :  string containing the URL to redirect the user.
	 *   - 'redirect'       :  trigger for redirect. If true, redirect user to page specified by redirectTarget.
	 */
	state = {
		redirectTarget: '',
		redirect: false,
	};

	render() {
		let { redirect, redirectTarget } = this.state;
        let { callback } = this.props;

		/* If redirect is true, redirect the user to the page specified by redirectTarget. */
		if (redirect === true) {
			redirect = false;
			return <Redirect push to={redirectTarget} />;
		}

		return (
			<div className={Style.homePage}>
				{/* SJA logo and title. */}
				<Icon component={() => (
					<img
						src={require('../Images/SJA-logo.svg')}
						height="250px"
						alt="Smart Job Advisor"
					/>
				)} />
				<h1>Smart Job Advisor</h1>
				<br />
				<h3>What would you like to do?</h3>

				{/* Container to hold buttons, one for New Job and one for Job History. */}
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