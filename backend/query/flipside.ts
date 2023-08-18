import { Flipside, QueryResultRecord } from "@flipsidecrypto/sdk";
import "dotenv/config";


const FLIPSIDE_API_KEY = process.env.FLIPSIDE_API_KEY;
const API_BASE_URL = "https://api-v2.flipsidecrypto.xyz";

export async function getUserBalances(): Promise<[QueryResultRecord[] | null, Error | null]> {
  if (!FLIPSIDE_API_KEY) throw new Error("no api key");

  // Create an instance of the SDK
  const flipside = new Flipside(FLIPSIDE_API_KEY, API_BASE_URL);

const sql = `
    SELECT
        CONTRACT_ADDRESS,
        USER_ADDRESS,
        USD_VALUE_NOW
    FROM
        ethereum.core.ez_current_balances
    WHERE
        USD_VALUE_NOW > 10000
        AND USD_VALUE_NOW < 20000
        AND CONTRACT_ADDRESS = LOWER('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
    LIMIT 2000;`

const queryResultSet = await flipside.query.run({sql: sql, maxAgeMinutes: 1440});

// what page are we starting on?
let currentPageNumber = 1

// How many records do we want to return in the page?
let pageSize = 1000

// set total pages to 1 higher than the `currentPageNumber` until
// we receive the total pages from `getQueryResults` given the 
// provided `pageSize` (totalPages is dynamically determined by the API 
// based on the `pageSize` you provide)
let totalPages = 2


// we'll store all the page results in `allRows`
let result : QueryResultRecord[] = [];

while (currentPageNumber <= totalPages && queryResultSet.queryId) {
  let results = await flipside.query.getQueryResults({
    queryRunId: queryResultSet.queryId,
    pageNumber: currentPageNumber,
    pageSize: pageSize,
  });

  if (results.error) {
    throw results.error;
  }

  if(!results.page || !results.records ) {
    return [null, null]
  }

  totalPages = results.page.totalPages;
  result = [...result, ...results.records];
  currentPageNumber += 1;
}
  return [result, null];
}