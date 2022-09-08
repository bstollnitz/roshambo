import { request } from "https";
import { RestError } from "@azure/core-http";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const inferenceApi = process.env["INFERENCE_ENDPOINT"] || '';
const inferenceKey = process.env["INFERENCE_KEY"] || '';

function httpsPost({body, ...options}) {
    return new Promise<Buffer>((resolve, reject) => {
        const req = request({
            method: 'POST',
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                const resBody = Buffer.concat(chunks);
                resolve(resBody)
            })
        })
        req.on('error', reject);
        if (body) {
            req.write(body);
        }
        req.end();
    })
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const url = new URL(inferenceApi);
        const response = await httpsPost({
            host: url.host,
            path: url.pathname,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${inferenceKey}`,
            },
            body: req.rawBody
        });
        context.res = {
            status: 200,
            body: response
        };
    } catch (error) {
        const e = error as RestError;
        context.res = {
            status: 200,
            body: {
                error: {
                    code: e.code,
                    details: e.details,
                    message: e.message,
                    name: e.name,
                    statusCode: e.statusCode,
                },
            }
        };
    }
};

export default httpTrigger;