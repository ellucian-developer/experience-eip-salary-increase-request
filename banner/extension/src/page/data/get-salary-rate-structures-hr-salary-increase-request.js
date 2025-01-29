/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import log from "loglevel";
const logger = log.getLogger("default");

export const resourceName = process.env.PIPELINE_SALARY_RATE_STRUCTURES;

export async function fetchSalaryRateStructure({ authenticatedEthosFetch, queryKeys, signal }) {
    if (!process.env.PIPELINE_SALARY_RATE_STRUCTURES) {
        const message = "PIPELINE_SALARY_RATE_STRUCTURES is not defined in environment!";
        console.error(message);
        throw new Error(message);
    }
    const { cardId, cardPrefix, payTable, payGroup } = queryKeys;

    try {
        const start = new Date();

        if (!payTable || !payGroup) {
            return {
                data: undefined
            };
        }

        const searchParameters = new URLSearchParams({
            cardId,
            cardPrefix,
            payGroup,
            payTable
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
