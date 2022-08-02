'';

/* eslint-disable @typescript-eslint/no-var-requires */
const { workerData, parentPort, SHARE_ENV } = require('worker_threads');

const RedisMock = require('ioredis-mock');
// const RateLimter = require('./MockRateLimiter');

const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// import RateLimter from 'graphqlgate';
const redis = new RedisMock();

// worker threads can share memory via transfer of Array Buffer instances

async function getProjectQueries(projectId) {
    const query = `query {project(id: "${projectId}") {
        queries {
            id
            projectID
            number
            complexity
            depth
            tokens
            success
            timestamp
            loggedOn
            latency
        }}}`;
    return nodeFetch(`http://localhost:${process.env.PORT}/gql/?query=${query}`).then((res) =>
        res.json()
    );
}

const { projectId, config } = workerData;

// TODO: Configure the rate limiter

getProjectQueries(projectId).then((queries) => {
    const data = queries?.data?.project?.queries;
    if (!data) {
        // TODO: Send a 404 response
        throw new Error('No query data for this project');
    }

    // TODO: Reprocess the data ensure queries are
    data.sort((a, b) => a.timestamp - b.timestamp);

    data.forEach((query) => {
        // TODO: Uncomment these lines once limiter is imported
        // const response = limiter.processRequest(query.timestamp, query.complexity);
        // mutate the original array for the sake of efficiency
        // query.success = response.success;
        // query.tokens = response.tokens;
        // return query;
    });

    parentPort.postMessage(data);
    parentPort.postMessage('DONE');
});
