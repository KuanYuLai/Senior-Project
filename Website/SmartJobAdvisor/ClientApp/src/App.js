import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { Menu, Icon, Layout } from 'antd';
import { Home } from './components/Home';

import NewJob from './components/NewJob';
import JobHistory from './components/JobHistory';
import { JobResults } from './components/JobResults';

import 'antd/dist/antd.css';
import Style from './CSS/App.module.css'

const { Content } = Layout;

/* The main page of the site, essentially a container. All other pages are rendered within.
 * Allows the navigation bar to be visible on every page, handles window dimensions with an eventlistener. */
export default class App extends Component {
	state = {
		currentPage: 'home',
	};

	/* Highlights the proper tab in the navigation bar, even after page refresh. */
	componentDidMount = () => {
		// Get the current page for the menu
		var URL = window.location.href;

		/* Sets the current page that the user is on. Used for highlighting the correct tab in the navigation bar.
		 * This is a kind of messy way of doing this, but it doesn't really matter. */
		if (URL.includes('new-job')) {
			this.setState({ currentPage: 'new-job' });
		} else if (URL.includes('job-history')) {
			this.setState({currentPage: 'job-history' });
		} else if (URL.includes('job-results')) {
			this.setState({currentPage: 'job-results' });
		} else {
			this.setState({ currentPage: 'home' });
		}

		/* Add event listener for window resize. Helps with table formatting on small screens. */
		this.updateWindowDimensions();
		window.addEventListener('resize', this.updateWindowDimensions);
	}

	/* Called when the component is unmounted. Removes the event listener. */
	componentWillUnmount = () => {
		window.removeEventListener('resize', this.updateWindowDimensions);
	}

	/* Gets window dimensions. */
	updateWindowDimensions = () => {
		this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
	}

	/* When a menu item is clicked, set the correct page. */
	handleMenuClick = (page) => {
		if (page === "navImage")
			this.setState({ currentPage: 'home' });
		else
			this.setState({ currentPage: page });
	};

	render() {
		return (
			<Router>
				<Layout>
					{/* The navigation bar. Each entry links to its respective page. */}
					<Menu onClick={(e) => {this.handleMenuClick(e.key)}} selectedKeys={[this.state.currentPage]} mode="horizontal">
						<Menu.Item key="navImage">
							<img
								className={Style.navIcon}
								src={require('./Images/SJA-logo.svg')} height="30px"
								alt="Smart Job Advisor"
							/>
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
					</Menu>

					{/* Used to define what component is rendered when Link is called. */}
					<Content style={{ height: 'calc(100vh - 48px)' }}>
						<div className={Style.mainContent}>
							<Switch>
								<Route exact path='/' render={(props) => <Home {...props} callback={this.handleMenuClick} windowWidth={this.state.windowWidth} windowHeight={this.state.windowHeight} />} />
								<Route exact path='/new-job' render={(props) => <NewJob {...props} windowWidth={this.state.windowWidth} windowHeight={this.state.windowHeight} />} />
								<Route exact path='/job-history' render={(props) => <JobHistory {...props} windowWidth={this.state.windowWidth} windowHeight={this.state.windowHeight} />} />
								<Route path='/job-results' component={JobResults} windowWidth={this.state.windowWidth} windowHeight={this.state.windowHeight} />
							</Switch>
						</div>
					</Content>
				</Layout>
			</Router>
		);
	}
}