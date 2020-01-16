import React, { Component, Fragment } from 'react';
import { Button, Icon } from 'antd';

import Style from '../CSS/Home.module.css'

export class Home extends Component {
	render () {
		return (
			<div className={Style.homePage}>
				<Icon component={() => (<img src={require('../Images/HP_Logo.svg')} height="250px" />)} />
				<br />
				<h3>What would you like to do?</h3>

				<div className={Style.buttonContainer}>
					<Button className={Style.button} type="primary"><Icon className={Style.buttonIcon} type="plus" />New Job</Button>
					<Button className={Style.button} type="default"><Icon className={Style.buttonIcon} type="history" />View History</Button>
				</div>
			</div>
		);
	}
}