/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import log from "loglevel";
const logger = log.getLogger("default");

export const resourceName = process.env.PIPELINE_JOB_CHANGE_REASONS;

export async function fetchJobChangeReasons({ authenticatedEthosFetch, queryKeys, signal }) {
	if (!process.env.PIPELINE_JOB_CHANGE_REASONS) {
		const message = "PIPELINE_JOB_CHANGE_REASONS is not defined in environment!";
		console.error(message);
		throw new Error(message);
	}
	const { cardId, cardPrefix } = queryKeys;

	try {
		const start = new Date();
		const searchParameters = new URLSearchParams({
			cardId,
			cardPrefix
		}).toString();

		const response = await authenticatedEthosFetch(`${resourceName}?${searchParameters}`, {
			headers: {
				Accept: "application/json"
			},
			signal
		});
		const data = await response.json();
		const end = new Date();
		logger.debug(`fetch ${resourceName} time: ${end.getTime() - start.getTime()}`);

		if (Number(response.status) !== 200) {
			return {
				error: {
					message: data?.message,
					statusCode: response.status
				}
			};
		}

		return {
			data,
			dataError: null,
			isError: false,
			statusCode: 200
		};
	} catch (error) {
		logger.error("unable to fetch data: ", error);
		throw error;
	}
}
