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
	Dropdown,
	Snackbar,
	Skeleton,
	DropdownItem,
	SearchItem,
	Typography,
	CircularProgress,
	DatePicker,
	makeStyles
} from "@ellucian/react-design-system/core";
import React, { useState, useEffect, useCallback } from "react";
import { usePageControl, useData, useCardInfo, useUserInfo } from "@ellucian/experience-extension-utils";
import { fetchPersons, resourceName as personsResource } from "./data/persons";
import { fetchPersonInfo, resourceName as personInfoResource } from "./data/get-persons-info-salary-increase-request";
import { fetchJobChangeReasons, resourceName as jobChangeReasons } from "./data/job-change-reasons";
import { fetchSalaryGrade, resourceName as salaryGradeResource } from "./data/x-salary-grade";
import { fetchSalaryStepInfo, resourceName as salaryStepInfoResource } from "./data/x-salary-step-info";
import { MultiDataQueryProvider, useDataQuery } from "@ellucian/experience-extension-extras";
import { omit } from "lodash";
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
		startOn: "",
		suffix: "",
		table: "",
		erpId: "",
		grade: ""
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

	const {
		data: salaryGrade = [],
		isLoading: loadingSalaryGrade,
		setEnabled: setSalaryGradeEnabled,
		setQueryKeys: setSalaryGradeQuerys
	} = useDataQuery(salaryGradeResource);

	const {
		data: salaryStepInfo = [],
		isLoading: loadingSalaryStepInfo,
		setEnabled: setSalaryStepInfoEnabled,
		setQueryKeys: setSalaryStepInfoQuerys
	} = useDataQuery(salaryStepInfoResource);

	const { data: reasons = [] } = useDataQuery(jobChangeReasons);
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

	const reset = () => {
		setData((data) => ({
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
			startOn: "",
			suffix: "",
			table: "",
			erpId: "",
			grade: ""
		}));
	};

	useEffect(() => {
		if (data.table && data.group) {
			setSalaryGradeQuerys({
				table: data.table,
				code: data.group
			});
			setSalaryGradeEnabled(true);
		}
	}, [data.table, data.group, setSalaryGradeQuerys, setSalaryGradeEnabled]);

	useEffect(() => {
		if (data.table && data.group && data.grade) {
			setSalaryStepInfoQuerys({
				table: data.table,
				code: data.group,
				grade: data.grade
			});
			setSalaryStepInfoEnabled(true);
		}
	}, [data.table, data.group, data.grade, setSalaryStepInfoQuerys, setSalaryStepInfoEnabled]);

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
		setPersonInfoQuerys({
			erpId: data.erpId,
			id: data.personId
		});
		setPersonInfoEnabled(true);
	}, [data.personId, data.erpId, setPersonInfoQuerys, setPersonInfoEnabled]);

	const submitForm = async (e) => {
		e.preventDefault();
		const payload = {
			id: workflowId.trim(),
			requestedFor: data?.personId,
			variables: {}
		};
		const newData = omit(data, ["table", "group", "departmentTitle", "startOn"]);
		for (const item in newData) {
			if (item in newData) {
				payload.variables[item] = {
					value: newData[item]
				};
			}
		}
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

	// function mask(input) {
	// 	// Convert the input to a string in case it is not
	// 	let str = input.toString();

	// 	// Check if the length of the string is greater than 4
	// 	if (str.length > 4) {
	// 		// Mask the first four digits
	// 		let maskedStr = "XXXX" + str.slice(4);
	// 		return maskedStr;
	// 	} else {
	// 		// If the string is 4 characters or less, return 'XXXX'
	// 		return "XXXX";
	// 	}
	// }

	const currenyFormat = useCallback((amount) => {
		return Number(amount).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}, []);

	setPageTitle("Salary Increase Request Form");

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
											const erpId = persons[index].credentials.find((item) => item.type === "bannerId")?.value;
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
										const erpId = person.credentials.find((item) => item.type === "bannerId")?.value;
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
											<span className={classes.infoTitle}>Start Date:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.startOn
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Position Title:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.employeePositionTitle
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Employee Rank:</span>{" "}
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													"02"
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
											<span className={classes.infoTitle}>Compensation Type:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.compensationType
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Group:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.group
												)}
											</div>
										</li>
										<li className={classes.infoList}>
											<span className={classes.infoTitle}>Table:</span>
											<div className={classes.dataPoint}>
												{loadingPersonInfo ? (
													<Skeleton className={classes.skelton} rectangle paragraph={{ width: 44 }} />
												) : (
													data?.table
												)}
											</div>
										</li>
									</ul>
								)}
								<Divider />
								<h4>Request Details</h4>
								<p>{`Select the appropriate grade and step for the employee's salary adjustment`}</p>
								<div className={classes.loaderContainer}>
									<Dropdown
										fullWidth
										id={`${customId}-new-grade`}
										label={loadingSalaryGrade ? "Loading" : "New Grade"}
										onChange={({ target: { value } }) => {
											setData({
												...data,
												grade: value
											});
										}}
										disabled={!data.personId}
										value={data.grade}
										className={classes.field}
									>
										{salaryGrade.map((grade, index) => (
											<DropdownItem key={index} label={grade?.NTRSALB_GRADE} value={grade?.NTRSALB_GRADE} />
										))}
									</Dropdown>
									{loadingSalaryGrade && (
										<div className={classes.loadingCircular}>
											<CircularProgress />
										</div>
									)}
								</div>
								<div className={classes.loaderContainer}>
									<Dropdown
										fullWidth
										id={`${customId}-annual-salary`}
										label={loadingSalaryStepInfo ? "Loading" : "Annual Salary or Base Wage"}
										onChange={({ target: { value } }) => {
											const record = salaryStepInfo.find((step) => step.NTRSALA_STEP === value);
											setData({
												...data,
												proposedSalary: parseInt(record?.NTRSALA_AMOUNT).toString(),
												step: record?.NTRSALA_STEP
											});
										}}
										disabled={!data.personId}
										value={data.step}
										className={classes.field}
									>
										{salaryStepInfo.map((step) => (
											<DropdownItem
												key={`${step?.NTRSALA_STEP}-${step?.NTRSALA_AMOUNT}`}
												label={`${step?.NTRSALA_STEP} - $${currenyFormat(step?.NTRSALA_AMOUNT)}`}
												value={step?.NTRSALA_STEP}
											/>
										))}
									</Dropdown>
									{loadingSalaryStepInfo && (
										<div className={classes.loadingCircular}>
											<CircularProgress />
										</div>
									)}
								</div>
								<Typography gutterBottom>Choose the reason for the salary increase from options below</Typography>
								<Dropdown
									id={`${customId}-reason-code`}
									label="Reason Code*"
									disabled={!data.personId}
									onChange={({ target: { value } }) => {
										setData({
											...data,
											reasonCode: value
										});
									}}
									value={data.reasonCode}
									className={classes.field}
								>
									{reasons.map((reason) => (
										<DropdownItem key={reason.code} label={reason.title} value={reason.title} />
									))}
								</Dropdown>
								<div className={classes.fieldWrapper}>
									<Typography gutterBottom>Indicate the date from which the new salary will be applied</Typography>
									<DatePicker
										label="Effective Date*"
										id={`${customId}-effective-date`}
										disabled={!data.personId}
										value={data.effectiveDate}
										fullWidth
										withMonthYearSelect
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
								<Typography gutterTop>
									Provide justification for the salary increase, including relevant details such as performance metrics
									or market research. Your input will aid in the evaluation and approval process
								</Typography>
								<TextField
									id={`${customId}-justification`}
									label="Add Justification*"
									margin="normal"
									multiline
									fullWidth
									onChange={({ target: { value } }) => {
										setData((data) => ({
											...data,
											justification: value
										}));
									}}
									value={data.justification}
									disabled={!data.personId}
									className={classes.field}
								/>
								{/* <Typography variant="h4">Attachments (If Any)</Typography>
								<Button id={`${customId}-file-upload`} endIcon={<Icon name="upload" />} className={classes.fieldUpload}>
									Attach Files
								</Button> */}
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
		},
		{
			...options,
			queryFunction: fetchSalaryGrade,
			resource: salaryGradeResource
		},
		{
			...options,
			queryFunction: fetchSalaryStepInfo,
			resource: salaryStepInfoResource
		},
		{
			...options,
			enabled: true,
			queryFunction: fetchJobChangeReasons,
			resource: jobChangeReasons
		}
	];

	return (
		<MultiDataQueryProvider options={config}>
			<SalaryIncreaseRequestPage />
		</MultiDataQueryProvider>
	);
}

export default SalaryIncreaseRequestPageProviders;
