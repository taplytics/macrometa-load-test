import {API_KEY} from './secrets'
import jsc8 from 'jsc8'

// Region URLs
const global_url = "https://gdn.paas.macrometa.io"
const insert_region_url = "https://varden-0a122c98-us-west.paas.macrometa.io/" // Fremont, US
const read_region_url = "https://varden-0a122c98-ap-west.paas.macrometa.io/" // Mumbai, India

const collection_name = "entity_coll"
const regional_collection_name = "regional_entity_coll"

let read_data = {
    "query": {
        "name": "readEntity",
        "value": `FOR entity in ${collection_name} FILTER entity.project_id == "project_1" FILTER entity.entity_id == @entity_id RETURN entity`,
        "parameter": {"entity_id": ""}
    }
}

let read_regional_data = {
    "query": {
        "name": "readEntityRegional",
        "value": `FOR entity in ${regional_collection_name} FILTER entity.project_id == "project_1" FILTER entity.entity_id == @entity_id RETURN entity`,
        "parameter": {"entity_id": ""}
    }
}

let idPrefix = ''

export class Macrometa {
    async initialize() {
        this.client = new jsc8({url: global_url, apiKey: API_KEY, fabricName: '_system', agent: fetch})
        // @ts-ignore
        this.insertRegionClient = new jsc8({
            url: insert_region_url,
            apiKey: API_KEY,
            fabricName: '_system',
            agent: fetch
        })
        // @ts-ignore
        this.readRegionClient = new jsc8({url: read_region_url, apiKey: API_KEY, fabricName: '_system', agent: fetch})

        await this.createCollection()
        await this.createCollectionInRegion()
        try {
            await this.client.createRestql(read_data.query.name.toString(), read_data.query.value.toString(), {})
            await this.client.createRestql(read_regional_data.query.name.toString(), read_regional_data.query.value.toString(), {})
        } catch (e) {

        }
    }


    // create collection
    async createCollection() {
        // console.log(`Creating the collection ${collection_name}...`);
        const coll_exists = await this.client.hasCollection(collection_name)
        if (coll_exists === false) {
            await this.client.createCollection(collection_name)
        }
    }

    // insert document in global_url region
    async insertData(id, body) {
        const data = {...body, entity_id: `${idPrefix}-entity_${id}`, project_id: 'project_1'}
        await this.client.insertDocument(collection_name, data)
    }

    // read data in global_url region
    async readData(id) {
        console.log(`"${idPrefix}-entity_${id}"`)
        return await this.client.executeRestql(read_data.query.name.toString(), {"entity_id": `${idPrefix}-entity_${id}`})
    }

    // create collection in region
    async createCollectionInRegion() {
            // console.log(`Creating the collection ${collection_name}...`);
        const hasCollection = await this.client.hasCollection(regional_collection_name)
        if (hasCollection) return
        await this.client.createCollection(regional_collection_name)
        while (!(await this.client.hasCollection(regional_collection_name))) {
        }
    }

    // insert data from region
    async insertDataInRegion(id, body) {
        const data = {...body, entity_id: `${idPrefix}-entity_${id}`, project_id: 'project_1'}
        await this.insertRegionClient.insertDocument(regional_collection_name, data)
    }

    // read data from a different regions
    async readDataFromDiffRegion(id) {
        return await this.readRegionClient.executeRestql(read_regional_data.query.name.toString(), {"entity_id": `${idPrefix}-entity_${id}`})
    }
}
