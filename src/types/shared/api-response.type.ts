/** Shape of the JSON body the API returns (success and error cases). */
export type ApiResult<T = unknown> = {
    success: boolean;
    statusCode?: number;
    message?: string;
    data?: T;
};

/** Type guard for HTTP 409 conflict responses (e.g. duplicate exam). */
export const isConflictResponse = (res: unknown): res is ApiResult => {
    if (typeof res !== "object" || res === null) return false;
    const body = res as { success?: unknown; statusCode?: unknown };
    return body.success === false && body.statusCode === 409;
};
