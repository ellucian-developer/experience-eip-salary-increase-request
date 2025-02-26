import React from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SalaryIncreaseRequestPage from "./SalaryIncreaseRequestPage";

// for more information on react router: https://v5.reactrouter.com/web/guides/quick-start

const RouterPage = (props) => {
	return (
		<Router basename={props.pageInfo.basePath}>
			<Switch>
				<Route path="/">
					<SalaryIncreaseRequestPage {...props} />
				</Route>
			</Switch>
		</Router>
	);
};

RouterPage.propTypes = {
	pageInfo: PropTypes.object
};

export default RouterPage;
