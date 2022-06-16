# macrometa-load-test
This repo contains a load test that uses a local process to make api requests to a cloudflare worker. 
That worker makes read/write requests to macrometa using both the global URL, and specific region URLs.

The steps below will explain how to run the test.

## Setup
1. Create a file called `secrets.js` inside the `src` directory that exports a macrometa api key. ```exports.API_KEY = <key>```
2. Run `npm install && npm run build`
3. Copy `shim.mjs` from the `src` directory into the newly created `dist` dir
4. Run `wrangler publish` *Note: You will need to have wrangler setup, logged in and authenticated for this to work

## Running
You can run the load testing script by doing `node loadTest.jms`. 
This will hit the published cloudflare worker. 

If you wish to run entirely on local, you can run `wrangler dev` in a separate tab,
and use the local url `const base = 'http://127.0.0.1:8787'` in `loadTest.mjs`
instead of the cloudflare worker url.
