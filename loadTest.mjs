import axios from 'axios'
import pmap from 'p-map'

const testSize = 1000
const parallelism = 10

// change the prefix to isolate from other tests
let userIdPrefx = 'some-string'

const waitAfterWriting = false

// const base = 'https://macrometa-load-test.taplytics.workers.dev'
const base = 'http://127.0.0.1:8787'

let retrieveTime = 0
let regionalRetrieveTime = 0
let updateTime = 0
let regionalUpdateTime = 0

let realUpdateTime = 0
let realRegionalUpdateTime = 0
let realRetrieveTime = 0
let realRegionalRetrieveTime = 0

let realNothingTime = 0

const entityData =
    {
        "appBuild": 1,
        "appVersion": "1.0.0",
        "country": "US",
        "customData": {
            "my_custom_data": "my_custom_data_value"
        },
        "deviceModel": "iPhone"
    };

async function write(i) {
    const writeUrl = new URL('/macro-update', base)
    let startTime = Date.now()
    try {
        const update = await axios.post(writeUrl.href, entityData, {
            params: {user_id: `${userIdPrefx}-user_id-${i}`},
            validateStatus: (status) => status === 200 || status === 201
        })
        updateTime += update.data.time
        realUpdateTime += Date.now() - startTime
    } catch (e) {
        console.error('request failed')
        console.log(e.response.data)
    }
}

async function read(i) {
    const readUrl = new URL('/macro-get', base)
    let startTime = Date.now()
    try {
        const retrieve = await axios.get(readUrl.href, {params: {user_id: `${userIdPrefx}-user_id-${i}`},
            validateStatus: (status) => status === 200 || status === 201
        })
        retrieveTime += retrieve.data.time
        realRetrieveTime += Date.now() - startTime
    } catch (e) {
        console.error('request failed')
        console.log(e.response.data)
    }
}

async function writeRegional(i) {
    const writeUrl = new URL('/macro-update-regional', base)
    let startTime = Date.now()
    try {
        const update = await axios.post(writeUrl.href, entityData, {params: {user_id: `${userIdPrefx}-user_id-${i}`},
            validateStatus: (status) => status === 200 || status === 201
        })
        regionalUpdateTime += update.data.time
        realRegionalUpdateTime += Date.now() - startTime
    } catch (e) {
        console.error('request failed')
        console.log(e.response.data)
    }
}

async function readRegional(i) {
    const readUrl = new URL('/macro-get-regional', base)
    let startTime = Date.now()
    try {
        const retrieve = await axios.get(readUrl.href, {params: {user_id: `${userIdPrefx}-user_id-${i}`},
            validateStatus: (status) => status === 200 || status === 201
        })
        regionalRetrieveTime += retrieve.data.time
        realRegionalRetrieveTime += Date.now() - startTime
    } catch (e) {
        console.error('request failed')
        console.log(e.response.data)
    }
}

async function nothing() {
    const nothingUrl = new URL('/skip', base)
    let startTime = Date.now()
    try {
        await axios.get(nothingUrl.href)
    } catch (e) {
        console.error('request failed')
        console.log(e.response.data)
    }
    realNothingTime += Date.now() - startTime
}

const tasks = []
for (let i = 0; i < testSize; i++) {
    tasks.push(i)
}

console.log("Starting Global Tests")
console.log("Writing")
await pmap(tasks, write, {concurrency: parallelism})
if (waitAfterWriting) {
    console.log("Finished writing, waiting 35 seconds for cached objects to hopefully purge")
    await new Promise(resolve => setTimeout(resolve, 35000))
}

console.log("Doing Nothing")
await pmap(tasks, nothing, {concurrency: parallelism})
console.log("Reading")
await pmap(tasks, read, {concurrency: parallelism})

userIdPrefx += '-regional'
console.log("Starting Regional Tests")
console.log("Writing")
await pmap(tasks, writeRegional, {concurrency: parallelism})
if (waitAfterWriting) {
    console.log("Finished writing, waiting 35 seconds for cached objects to hopefully purge")
    await new Promise(resolve => setTimeout(resolve, 35000))
}
console.log("Reading")
await pmap(tasks, readRegional, {concurrency: parallelism})


console.log("GLOBAL RESULTS!")
console.log(`Average Retrieve time: ${retrieveTime / testSize} ms`)
console.log(`Average Update time: ${updateTime  / testSize} ms`)
console.log(`Average Real Retrieve time: ${realRetrieveTime / testSize} ms`)
console.log(`Average Real Update time: ${realUpdateTime  / testSize} ms`)
console.log(`Average No Op Time: ${realNothingTime / testSize} ms`)
console.log(`Average performance cost of Macrometa access: ${(realRetrieveTime - realNothingTime) / testSize} ms`)
console.log(" ")
console.log("REGIONAL RESULTS!")
console.log(`Average Regional Retrieve time: ${regionalRetrieveTime / testSize} ms`)
console.log(`Average Regional Update time: ${regionalUpdateTime  / testSize} ms`)
console.log(`Average Real Retrieve time: ${realRegionalRetrieveTime / testSize} ms`)
console.log(`Average Real Update time: ${realRegionalUpdateTime  / testSize} ms`)
console.log(`Average No Op Time: ${realNothingTime / testSize} ms`)
console.log(`Average performance cost of Macrometa access: ${(realRegionalRetrieveTime - realNothingTime) / testSize} ms`)

