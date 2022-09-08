// import axios from "axios";
import fetch from "node-fetch";
import { RestError } from "@azure/core-http";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const inferenceApi = process.env["INFERENCE_ENDPOINT"] || '';
const inferenceKey = process.env["INFERENCE_KEY"] || '';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        // const response = await axios.post(inferenceApi, req.body,
        //     {
        //         headers: {
        //             "Content-Type": "application/json",
        //             Authorization: `Bearer ${inferenceKey}`,
        //         },
        //     }
        // );
        const response = await fetch(inferenceApi, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${inferenceKey}`,
            },
            body: JSON.stringify(req.body)
        });
        const text = await response.text()
        context.res = {
            status: 200,
            body: text
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