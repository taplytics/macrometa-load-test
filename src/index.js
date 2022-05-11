const {Macrometa} = require("./macrometa")

exports.handlers = {
    async fetch(request, env) {
        const time = Date.now()

        console.log("FETCHING")
        const url = new URL(request.url)

        if (url.pathname.includes('skip')) {
            return new Response("true")
        }
        if (url.pathname.includes('be0db296b5b11d083828af8d1c00e64c')) {
            return new Response("loaderio-be0db296b5b11d083828af8d1c00e64c")
        }

        const macrometa = new Macrometa()

        const user_id = url.searchParams?.get('user_id') || ''

        if (!user_id) {
            const response = new Response("user_id is required", {status: 4000})
            return response
        }

        let data = {}
        let initialized = false
        try {
            if (url.pathname.includes('macro')) {
                await macrometa.initialize()
                initialized = true
                if (url.pathname.includes('macro-get')) {
                    data = await macrometa.readData(user_id)
                } else if (url.pathname.includes('macro-update')) {
                    const body = await request.json()
                    await macrometa.insertData(user_id, body)
                } else if (url.pathname.includes('macro-get-regional')) {
                    data = await macrometa.readDataFromDiffRegion(user_id)
                } else if (url.pathname.includes('macro-update-regional')) {
                    const body = await request.json()
                    await macrometa.insertDataInRegion(user_id, body)
                }
            }
        } catch (e) {
            console.error(e)
            const response = new Response(`macrometa error: ${e.response?.body?.errorMessage}, regular error: ${e.message}, initialized: ${initialized}`,
                {status: 500}
            )
            return response
        }


        return new Response(JSON.stringify({time: Date.now() - time, data: data.result?.[0]}))
    }
}
