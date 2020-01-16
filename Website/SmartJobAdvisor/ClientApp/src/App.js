import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Menu, Icon } from 'antd';
import { Home } from './components/Home';

//import { Layout } from './components/Layout';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';

import 'antd/dist/antd.css';
import Style from './CSS/App.module.css'

const { SubMenu } = Menu;

export default class App extends Component {
	state = {
		currentPage: 'home',
	};

	handleMenuClick = e => {
		if (e.key === 'navImage')
			this.setState({ currentPage: 'home' });
		else
			this.setState({ currentPage: e.key });
	};

	render () {
		return (
			<Fragment>
				<Menu onClick={this.handleMenuClick} selectedKeys={[this.state.currentPage]} mode="horizontal">
					<Menu.Item key="navImage">
						<Icon className={Style.navIcon} component={() => (<img src={require('./Images/HP_Logo.svg')} height="25px" />)} />
					</Menu.Item>

					<Menu.Item key="home">
						<Icon className={Style.navIcon} type="home" />
						Home
						<Link to="/" />
					</Menu.Item>

					<Menu.Item key="counter">
						<Icon className={Style.navIcon} type="plus" />
						Counter
						<Link to="/counter" />
					</Menu.Item>

					<Menu.Item key="data">
						<Icon className={Style.navIcon} type="cloud" />
						Weather
						<Link to="/weather" />
					</Menu.Item>
				</Menu>

				<div className={Style.mainContent}>
					<Route exact path='/' component={Home} />
					<Route path='/counter' component={Counter} />
					<Route path='/weather' component={FetchData} />
				</div>
			</Fragment>
		);
	}
}
