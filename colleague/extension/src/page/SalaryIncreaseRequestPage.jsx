import {
	spacing20,
	spacing40,
	spacing30,
	colorCtaBlueBase,
	colorTextNeutral300,
	colorTextNeutral450,
	colorTextNeutral600
} from "@ellucian/react-design-system/core/styles/tokens";
import {
	Card,
	Grid,
	TextField,
	Search,
	Button,
	Divider,
	Snackbar,
	Skeleton,
	SearchItem,
	Typography,
	DatePicker,
	makeStyles
} from "@ellucian/react-design-system/core";
import React, { useState, useEffect, useCallback } from "react";
import { usePageControl, useData, useCardInfo, useUserInfo } from "@ellucian/experience-extension-utils";
import { fetchPersons, resourceName as personsResource } from "./data/persons";
import { fetchPersonInfo, resourceName as personInfoResource } from "./data/get-persons-info-salary-increase-request";
import { MultiDataQueryProvider, useDataQuery } from "@ellucian/experience-extension-extras";
import { pick } from "lodash";
import classNames from "classnames";
import "./style.css";

const useStyles = makeStyles((theme) => {
	return {
		card: {
			margin: `${spacing40} auto`,
			width: "100%",
			maxWidth: "1080px"
		},
		progress: {
			listStyle: "none",
			paddingLeft: 0,
			[theme.breakpoints.down("md")]: {
				display: "none"
			}
		},
		separator: {
			width: "1px",
			height: "30px",
			backgroundColor: colorTextNeutral300,
			marginLeft: spacing40
		},
		progressList: {
			padding: `${spacing40} 0`
		},
		field: {
			marginBottom: `${spacing40} !important`,
			marginTop: "0 !important",
			flexGrow: "1"
		},
		fieldWrapper: {
			marginBottom: `${spacing40} !important`,
			marginTop: "0 !important"
		},
		fieldUpload: {
			margin: `${spacing40} 0 !important`
		},
		progressNumber: {
			width: "30px",
			height: "30px",
			display: "inline-flex",
			justifyContent: "center",
			marginRight: spacing30,
			alignItems: "center",
			borderRadius: "100%",
			border: `1px solid ${colorCtaBlueBase}`
		},
		highlight: {
			backgroundColor: colorCtaBlueBase,
			color: "white"
		},
		info: {
			display: "flex",
			justifyContent: "space-between",
			paddingLeft: 0,
			listStyle: "none",
			flexWrap: "wrap",
			[theme.breakpoints.down("lg")]: {
				flexDirection: "column"
			}
		},
		infoList: {
			width: "50%",
			marginBottom: spacing20,
			color: colorTextNeutral450,
			display: "flex",
			flexDirection: "row",
			[theme.breakpoints.down("lg")]: {
				width: "100%"
			}
		},
		dataPoint: {
			display: "block",
			padding: "0px 10px 0"
		},
		infoTitle: {
			color: colorTextNeutral600
		},
		submitButtonWrapper: {
			display: "flex",
			flexDirection: "row",
			gap: "10px",
			justifyContent: "flex-end",
			alignItems: "center",
		},
		skelton: {
			width: "200px",
			paddingTop: "4px"
		},
		loaderContainer: {
			position: "relative",
			width: "100%",
			maxWidth: "335px"
		},
		loadingCircular: {
			position: "absolute",
			right: "-50px",
			top: "5px"
		}
	};
});

const SalaryIncreaseRequestPage = () => {
	const classes = useStyles();
	const userInfo = useUserInfo();
	const { setPageTitle } = usePageControl();
	const { configuration, cardConfiguration } = useCardInfo();
	const { workflowId } = configuration || cardConfiguration || {};
	const [submitting, setSubmitting] = useState(false);
	const [snackbarConfig, setSnackbarConfig] = useState({
		open: false,
		message: ""
	});
	const { authenticatedEthosFetch } = useData();
	const [data, setData] = useState({
		requestDate: new Date().toISOString().split("T")[0],
		requestedBy: "",
		employeeName: "",

		personId: "",
		justification: "",
		effectiveDate: "",
		step: "",
		compensationType: "",
		currency: "",
		proposedSalary: "",
		currentSalary: "",
		departmentId: "",
		departmentTitle: "",
		employeePositionTitle: "",
		employerId: "",
		group: "",
		positionCode: "",
		positionId: "",
		reasonForWageBox: "",
		startOn: "",
		suffix: "",
		erpId: "",
	});
	const {
		data: persons = [],
		isLoading: loadingPersons,
		setEnabled: setPersonsEnabled,
		setQueryKeys: setPersonsQueryKeys
	} = useDataQuery(personsResource);

	const {
		data: personInfo = {},
		isLoading: loadingPersonInfo,
		setEnabled: setPersonInfoEnabled,
		setQueryKeys: setPersonInfoQuerys
	} = useDataQuery(personInfoResource);

	// const { data: reasons = [] } = useDataQuery(jobChangeReasons);
	const customId = "salary-increase-request";

	useEffect(() => {
		if (Object.keys(userInfo || {}).length) {
			setData((data) => ({
				...data,
				requestedBy: userInfo?.firstName
			}));
		}
	}, [userInfo]);

	useEffect(() => {
		if (data.employeeName && data.employeeName.length > 2) {
			setPersonsQueryKeys({
				name: data.employeeName
			});
			setPersonsEnabled(true);
		}
	}, [data.employeeName, setPersonsQueryKeys, setPersonsEnabled]);

	useEffect(() => {
		if (Object.keys(personInfo).length) {
			setData((data) => ({
				...data,
				...personInfo,
				currentSalary: personInfo?.currentSalary?.toString()
			}));
		}
	}, [personInfo]);

	useEffect(() => {
		if (data.personId && data.erpId) {
			setPersonInfoQuerys({
				erpId: data.erpId,
				id: data.personId
			});
			setPersonInfoEnabled(true);
		}
	}, [data.personId, data.erpId, setPersonInfoQuerys, setPersonInfoEnabled]);

	const reset = () => {
		setData({
			...data,
			employeeName: "",
			personId: "",
			justification: "",
			effectiveDate: "",
			step: "",
			compensationType: "",
			currency: "",
			proposedSalary: "",
			currentSalary: "",
			departmentId: "",
			departmentTitle: "",
			employeePositionTitle: "",
			employerId: "",
			group: "",
			positionCode: "",
			positionId: "",
			reasonForWageBox: "",
			startOn: "",
			suffix: "",
			erpId: "",
		});
	};

	const submitForm = async (e) => {
		e.preventDefault();
		const payload = {
			id: workflowId.trim(),
			requestedFor: data?.personId,
			variables: {}
		};
		const newData = pick(data, [
			"employeeName",
			"positionTitle",
			"compensationType",
			"positionCode",
			"currentSalary",
			"proposedSalary",
			"effectiveDate",
			"personId",
			"erpId",
			"currency"
		]);
		for (const item in newData) {
			if (item in newData) {
				payload.variables[item] = {
					value: newData[item]
				};
			}
		}

		// payload.variables['requestedBy']  = {
		// 	value: userInfo?.
		// };
		payload.variables['requestDate']  = {
			value: new Date().toISOString().split("T")[0]
		};

		const args = {
			options: {
				method: "POST",
				headers: {
					Accept: "application/vnd.hedtech.integration.v1+json",
					"Content-Type": "application/vnd.hedtech.integration.v1+json"
				},
				body: JSON.stringify(payload)
			},
			resource: "workflow-instances"
		};

		setSubmitting(true);
		try {
			const response = await authenticatedEthosFetch(`${args.resource}`, args.options);
			await response.json();
			setSnackbarConfig({
				open: true,
				message: "Request submitted successfully"
			});
		} catch (exception) {
			setSnackbarConfig({
				open: true,
				message: "Oops! Something went wrong. Please try again"
			});
		}
		setSubmitting(false);
	};

	const currenyFormat = useCallback((amount) => {
		return Number(amount).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}, []);

	setPageTitle("Salary Increase Request Form");

	const erpIdName = 'colleaguePersonId';

	const [payPeriod = {}, year = {}] = data?.hoursPerPeriod || [];

	return (
		<div className={classes.card}>
			<Snackbar
				open={snackbarConfig.open}
				onClose={() =>
					setSnackbarConfig({
						open: false,
						message: ""
					})
				}
				message={snackbarConfig.message}
			/>
			<form onSubmit={submitForm}>
				<Grid container spacing={2}>
					<Grid item xs={12} lg={3}>
						<div>
							<ul className={classes.progress}>
								<li className={classes.progressList}>
									<span className={classNames(classes.progressNumber, data.erpId ? classes.highlight : null)}>1</span>
									Employee Information
								</li>
								<li className={classes.separator}></li>
								<li className={classes.progressList}>
									<span
										className={classNames(
											classes.progressNumber,
											data.grade && data.step && data.proposedSalary && data.reasonCode && data.effectiveDate
												? classes.highlight
												: null
										)}
									>
										2
									</span>
									Request Details
								</li>
								<li className={classes.separator}></li>
								<li className={classes.progressList}>
									<span className={classes.progressNumber}>3</span>
									Review and Submit
								</li>
							</ul>
						</div>
					</Grid>

					<Grid item xs={12} lg={9}>
						<Card>
							<div>
								<h2>Employee Salary Increase Request Form</h2>
								<h4>Employee Information</h4>
								<p>{`Search and Select the employee's Name or ERP ID for whom you are requesting a salary increase`}</p>
								<Search
									id="person-search"
									name="search"
									// onSearchInvoked={() => search()}
									onChange={({ target: { value } }) => {
										setData({
											...data,
											employeeName: value
										});
									}}
									placeholder="Person Search*"
									typeaheadOptions={{
										loading: loadingPersons,
										onItemSelect: (event, index) => {
											const personId = persons[index].id;
											const erpId = persons[index].credentials.find((item) => item.type === erpIdName)?.value;
											// const dateOfBirth = persons[index].dateOfBirth;
											// const ssn = persons[index].credentials.find((item) => item.type === "ssn")?.value;

											setData({
												...data,
												employeeName: persons[index]?.names[0].fullName,
												personId,
												// dateOfBirth,
												erpId
												// ssn
											});
										}
									}}
									fullWidth
									value={data.employeeName}
								>
									{persons.map((person) => {
										const [name] = person.names;
										const erpId = person.credentials.find((item) => item.type === erpIdName)?.value;
										const label = `${name.lastName}, ${name.firstName} (${erpId})`;
										return (
											<SearchItem key={person.id} value={person.id}>
												{label}
											</SearchItem>
										);
									})}
								</Search>
								{data.personId && data.erpId && (
									<ul className={classes.info}>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Name:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: "14sku" }} />
												) : (
													data?.employeeName
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Current Annual Salary:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													`$${currenyFormat(data?.currentSalary) || ""}`
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Position Title:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.positionTitle
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Pay Class:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.payCode
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Department:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.departmentTitle
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Pay Period Work Time:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													`${payPeriod?.hours} Hours`
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Position ID:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.positionCode
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Year/Holiday Work Time:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													`${year?.hours} Hours`
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Pay Factor:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.payFactor
												)}
											</div>
										</li>
									</ul>
								)}
								<Divider />
								<h4>Request Details</h4>
								<p>{`Enter the appropriate salary`}</p>
								<div className={classes.fieldWrapper}>
									<TextField
										id={`${customId}-salary`}
										label="Salary"
										name="salary"
										disabled={!data.personId}
										type="number"
										onChange={(e) => setData({
											...data,
											proposedSalary: e.toString()
										})}
										value={data.proposedSalary}
									/>
								</div>
								<p>{`Reason for Wage Change`}</p>
								<div className={classes.fieldWrapper}>
									<TextField
										id={`${customId}-wage-box`}
										label="Reasons"
										name="reason"
										disabled={!data.personId}
										onChange={(e) => setData({
											...data,
											reasonForWageBox: e.target.value
										})}
										value={data.reasonForWageBox}
									/>
								</div>
								<div className={classes.fieldWrapper}>
									<Typography gutterBottom>Indicate the date from which the new salary will be applied</Typography>
									<DatePicker
										label="Effective Date*"
										id={`${customId}-effective-date`}
										disabled={!data.personId}
										value={data.effectiveDate}
										fullWidth
										onDateChange={(value) => {
											let offset = value.getTimezoneOffset();
											let yourDate = new Date(value.getTime() - offset * 60 * 1000);
											yourDate = yourDate.toISOString().split("T")[0];
											setData((data) => ({
												...data,
												effectiveDate: yourDate
											}));
										}}
										classes={classes.field}
										PopperProps={{
											modifiers: [
												{
													name: 'flip',
													enabled: true,
												},
											]
										}}
									/>
								</div>
								<Divider />
								<div className={classes.submitButtonWrapper}>
									<div>
										<Button 
											onClick={reset}
											variant="text" type="button" disabled={!data.personId}>
											Reset
										</Button>
									</div>
									<div>
										<Button id={`${customId}-submit`} type="submit" disabled={!data.personId || submitting}>
											{submitting ? "Submitting" : "Submit"}
										</Button>
									</div>
								</div>
							</div>
						</Card>
					</Grid>
				</Grid>
			</form>
		</div>
	);
};

function SalaryIncreaseRequestPageProviders() {
	const options = {
		enabled: false,
		cacheEnabled: false,
		queryParameters: { acceptVersion: "1" }
	};

	const config = [
		{
			...options,
			queryFunction: fetchPersons,
			resource: personsResource
		},
		{
			...options,
			queryFunction: fetchPersonInfo,
			resource: personInfoResource
		}
	];

	return (
		<MultiDataQueryProvider options={config}>
			<SalaryIncreaseRequestPage />
		</MultiDataQueryProvider>
	);
}

export default SalaryIncreaseRequestPageProviders;
