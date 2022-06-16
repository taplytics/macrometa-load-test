import {API_KEY} from './secrets'
import jsc8 from 'jsc8'

// Region URLs
const global_url = "https://taplytics.macrometa.io"
const insert_region_url = "https://gdn-us-east5.paas.macrometa.io" // Cedar Knolls, US
const read_region_url = "https://gdn-eu-central5.paas.macrometa.io" // Frankfurt, Germany

const MACROMETA_ENTITIES_GET_QUERY = 'get_dev_entity_test'
const MACROMETA_ENTITIES_UPDATE_QUERY = 'update_dev_entity_test'

const MACROMETA_ENTITIES_GET_QUERY_REGIONAL = 'get_dev_entity_test_regional'
const MACROMETA_ENTITIES_UPDATE_QUERY_REGIONAL = 'update_dev_entity_test_regional'

let idPrefix = ''

export class Macrometa {
    async initialize() {
        this.client = new jsc8({url: global_url, apiKey: API_KEY, fabricName: '_system', agent: fetch})
        this.insertRegionClient = new jsc8({
            url: insert_region_url,
            apiKey: API_KEY,
            fabricName: '_system',
            agent: fetch
        })
        this.readRegionClient = new jsc8({url: read_region_url, apiKey: API_KEY, fabricName: '_system', agent: fetch})
    }

    async getEntity(unique_id) {
        return await this.client.executeRestql(MACROMETA_ENTITIES_GET_QUERY, {
            'unique_id': `${idPrefix}-entity_${unique_id}`,
            'project_id': 'project_1'
        })
    }

    async updateEntity(unique_id, entity) {
        return await this.client.executeRestql(MACROMETA_ENTITIES_UPDATE_QUERY, {
            'unique_id': `${idPrefix}-entity_${unique_id}`,
            'project_id': 'project_1',
            'entity': entity
        })
    }

    async getRegionEntity(unique_id) {
        return await this.readRegionClient.executeRestql(MACROMETA_ENTITIES_GET_QUERY_REGIONAL, {
            'unique_id': `${idPrefix}-entity_${unique_id}`,
            'project_id': 'project_1'
        })

    }

    async updateRegionEntity(unique_id, entity) {
        return await this.insertRegionClient.executeRestql(MACROMETA_ENTITIES_UPDATE_QUERY_REGIONAL, {
            'unique_id': `${idPrefix}-entity_${unique_id}`,
            'project_id': 'project_1',
            'entity': entity
        })

    }
}
