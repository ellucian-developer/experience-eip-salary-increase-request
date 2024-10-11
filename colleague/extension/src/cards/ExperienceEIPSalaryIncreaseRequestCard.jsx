import { withStyles } from "@ellucian/react-design-system/core/styles";
import { spacing40 } from "@ellucian/react-design-system/core/styles/tokens";
import { Typography, Button } from "@ellucian/react-design-system/core";
import PropTypes from "prop-types";
import React from "react";

const styles = () => ({
	card: {
		marginTop: 0,
		marginRight: spacing40,
		marginBottom: 0,
		marginLeft: spacing40,
		height: "100%"
	},
	wrapper: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "center",
		height: "100%",
		marginTop: spacing40
	},
	info: {
		textAlign: "center",
		marginBottom: spacing40,
		width: "100%",
		maxWidth: "270px"
	}
});

const ExperienceEIPSalaryIncreaseRequestCard = (props) => {
	const { classes } = props;

	return (
		<div className={classes.card}>
			<div className={classes.wrapper}>
				<Typography
					variant="p"
					className={classes.info}
				>{`Complete this form to request a salary increase on someone's behalf`}</Typography>
				<Button>Request Salary Increase</Button>
			</div>
		</div>
	);
};

ExperienceEIPSalaryIncreaseRequestCard.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ExperienceEIPSalaryIncreaseRequestCard);
