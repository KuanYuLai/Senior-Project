import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Redirect } from 'react-router';
import { Menu, Icon, Layout } from 'antd';
import { Home } from './components/Home';

import { NewJob } from './components/NewJob';
import { JobHistory } from './components/JobHistory';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';

import 'antd/dist/antd.css';
import Style from './CSS/App.module.css'

const { Header, Content, Footer } = Layout;

export default class App extends Component {
	state = {
		currentPage: 'home',
		redirect: false,
	};

	constructor() {
		super();

        this.redirect = false;
        this.redirectTarget = '';

		// Get the current page for the menu
		var URL = window.location.href;

		/* This is a really messy way of doing this, but it doesn't really matter. */
		if (URL.includes('new-job')) {
            this.state = { currentPage: 'new-job' };
		} else if (URL.includes('job-history')) {
            this.state = { currentPage: 'job-history' };
		} else {
			this.state = { currentPage: 'home' };
		}
	}

	handleMenuClick = (page, buttonClick = false) => {
		if (page === "navImage")
			this.setState({ currentPage: 'home' });
		else
			this.setState({ currentPage: page });

        if (buttonClick) {
            this.redirect = true;
            this.redirectTarget = page;
        }
	};

	render() {
		if (this.redirect === true) {
            this.redirect = false;
            return <Redirect push to={"/" + this.redirectTarget} />;
		}

		return (
			<Router>
				<Layout>
					<Menu onClick={(e) => {this.handleMenuClick(e.key)}} selectedKeys={[this.state.currentPage]} mode="horizontal">
						<Menu.Item key="navImage">
							<img className={Style.navIcon} src={require('./Images/SJA-logo.svg')} height="30px" />
							<Link to="/" />
						</Menu.Item>

						<Menu.Item key="home">
							<Icon className={Style.navIcon} type="home" />
							Home
							<Link to="/" />
						</Menu.Item>

						<Menu.Item key="new-job">
							<Icon className={Style.navIcon} type="plus" />
							New Job
							<Link to="/new-job" />
						</Menu.Item>

						<Menu.Item key="job-history">
							<Icon className={Style.navIcon} type="history" />
							Job History
							<Link to="/job-history" />
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

					<Content style={{ height: 'calc(100vh - 85px)' }}>
						<div className={Style.mainContent}>
							<Route exact path='/' render={(props) => <Home {...props} callback={this.handleMenuClick} />} />
                            <Route exact path='/new-job' component={NewJob} />
                            <Route exact path='/job-history' component={JobHistory} />
							<Route exact path='/counter' component={Counter} />
							<Route exact path='/weather' component={FetchData} />
						</div>
					</Content>

                    <Footer className={Style.appFooter}>
						Ant Design &copy;2016 Created by Ant UED
					</Footer>
				</Layout>
			</Router>
		);
	}
}