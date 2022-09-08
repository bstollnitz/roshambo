import axios from "axios";
import { RestError } from "@azure/core-http";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const inferenceApi = process.env["INFERENCE_ENDPOINT"] || '';
const inferencekey = process.env["INFERENCE_KEY"] || '';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    try {
        const response = await axios.post(inferenceApi, req.body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${inferencekey}`,
                },
            }
        );
        context.res = {
            status: 200,
            body: response.data
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