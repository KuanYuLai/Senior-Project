import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router';
import { Row, Col, Spin } from 'antd';

import { ServerURL } from './Home';

/* Handles uploading PDF files, including analyzing them for maxCoverage. */
export class JobUpload extends Component {
	constructor(props) {
		super(props);

		/* Build a list to hold PDF processing status: 0 means still working, 1 means done.
		 * Build an additional list to hold coverage values for each file. */
		let fileStatus = Array.from(Array(this.props.fileList.length), (_, i) => 0);
		let fileCoverage = Array.from(Array(this.props.fileList.length), (_, i) => 0);
		let jobIDs = Array.from(Array(this.props.fileList.length), (_, i) => 0);

		this.trigger = true;

		this.state = {
			fileList: this.props.fileList,
			fileStatus: fileStatus,
			fileCoverage: fileCoverage,
			uploadReady: false,
			jobIDs: jobIDs,
			complete: false,
			modalContent: null,
		};
	}

	componentDidMount = async () => {
		/* Generate the content for the modal */
		await this.buildModalContent();

		/* Start uploading PDFs to get coverage values. */
		for (let i = 0; i < this.state.fileList.length; i++)
			await this.uploadPDF(i);

		this.setState({ uploadReady: true });
	}

	/* Updates the text next to the file name to display the file's current status in processing.
	 * Statuses are:  analyzing for maxCoverage;  POSTing to new-job;  Done. */
	getFileStatusString = (index) => {
		switch (this.state.fileStatus[index]) {
			case 0:
				return <span><Spin size="small" /><strong>&nbsp;&nbsp;Analyzing...</strong></span>;
			case 1:
				return <span><Spin size="small" /><strong>&nbsp;&nbsp;Uploading...</strong></span>;
			case 2:
				return <span><strong>&#x2713; Done</strong></span>;
			default:
				return <span style={{ color: 'red' }}>ERROR</span>;
		}
	}

	buildModalContent = () => {
		let { fileList } = this.state;

		let modalContent = fileList.map((item, index) => {
			return (
				<Row key={fileList[index].name} gutter={10}>
					<Col key={fileList[index].name + "1"} span={6}>
						{this.getFileStatusString(index)}
					</Col>
					<Col key={fileList[index].name + "2"} span={18}>
						{fileList[index].name}
					</Col>
				</Row>
			);
		})

		this.setState({ modalContent: modalContent });
	}

	uploadPDF = async (index) => {
		const { fileList, fileStatus, fileCoverage } = this.state;

		const formData = new FormData();
		formData.append('file', fileList[index]);

		await fetch(ServerURL + 'upload/', {
			method: 'POST',
			mode: 'cors',
			name: 'pdf',
			body: formData,
		}).then(async (res) => {
			await res.json().then((data) => {
				let tempCoverage = [...fileCoverage];
				let tempStatus = [...fileStatus];

				tempCoverage[index] = parseInt(data.Coverage);
				tempStatus[index] = 1;

				this.setState({
					fileCoverage: tempCoverage,
					fileStatus: tempStatus,
				});
			});
		}).catch((err) => {
			console.log("ERROR: ", err)
		});



		/* Dummy endpoint that just returns a random number for use as maxCoverage value.
		 * Placeholder while York fixes the actual upload endpoint. * /
		await fetch(ServerURL + 'dummy/upload/', {
			method: 'POST',
			mode: 'cors',
			body: formData,
			headers: {
				'Accept': 'multipart/form-data',
				'Content-Type': 'multipart/form-data',
			}
		}).then(async (res) => {
			await res.json().then((data) => {
				let tempCoverage = [...fileCoverage];
				let tempStatus = [...fileStatus];

				tempCoverage[index] = parseInt(data.Coverage);
				tempStatus[index] = 1;

				this.setState({
					fileCoverage: tempCoverage,
					fileStatus: tempStatus,
				});
			});
		}).catch((err) => {
			console.log("ERROR: ", err)
		});
		*/

		this.buildModalContent();
	}

	submitJob = async (index) => {
		var { fileList, fileStatus, fileCoverage, jobIDs } = this.state;

		var tempValues = { ...this.props.formValues };

		tempValues.jobName = fileList[index].name.split(".pdf")[0];
		tempValues.maxCoverage = fileCoverage[index];

		await fetch(ServerURL + 'new-job/', {
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify(tempValues),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(function (response) {
			if (response.ok)
				return response.json();

			throw new Error(response.text());
		}).then((data) => {
			let tempStatus = [...fileStatus];
			let tempJobIDs = [...jobIDs];

			tempStatus[index] = 2;
			tempJobIDs[index] = data.id;

			this.setState({
				fileStatus: tempStatus,
				jobIDs: tempJobIDs,
			});
		}).catch((err) => {
			console.log("Error in POST call: ", err);
		});

		this.buildModalContent();
	}

	submitJobHandler = async () => {
		for (let i = 0; i < this.state.fileStatus.length; i++)
			await this.submitJob(i);

		var idString = [...this.state.jobIDs];
		idString = idString.join();

		this.setState({ idString: idString })

		/* Wait a bit to set complete so that users can see that jobs are done. */
		setTimeout(() => {
			this.setState({ complete: true,  });
		}, 1000);
	}

	render() {
		var { uploadReady, complete, idString } = this.state;

		/* Only start POSTing to Rules Engine if all files are done being processed.
		 * 'this.trigger' ensures that this function is called at most one time to prevent double POSTing. */
		if (uploadReady && this.trigger) {
			this.trigger = false;

			this.submitJobHandler();
		}

		if (complete)
			return <Redirect to={{ pathname: '/job-results', search: '?justifications=true?IDs=' + idString }} />;
		else
			return (
				<Fragment>
					<strong><span style={{ color: 'red' }}>Caution:</span>&nbsp;&nbsp;&nbsp;Do not exit this page while files are uploading!</strong>
					<br /><br />

					{this.state.modalContent}

					{complete}
				</Fragment>
			);
	}
}