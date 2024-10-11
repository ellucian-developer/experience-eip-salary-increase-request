module.exports = {
	name: "Salary Increase Request",
	publisher: "Sample",
	cards: [
		{
			type: "Salary Increase Request Card",
			source: "./src/cards/ExperienceEIPSalaryIncreaseRequestCard",
			title: "Salary Increase Request Card",
			displayCardType: "Experience EIP Salary Increase Request Card",
			description: "This is an introductory card to the Ellucian Experience SDK",
			configuration: {
				server: [
					{
						key: "ethosApiKey",
						label: "Ethos API Key",
						type: "password",
						require: true
					}
				],
				client: [
					{
						key: "workflowId",
						label: "Workflow ID",
						type: "text",
						require: true
					}
				]
			},
			pageRoute: {
				route: "/",
				excludeClickSelectors: ["a"]
			}
		}
	],
	page: {
		source: "./src/page/router.jsx"
	}
};
