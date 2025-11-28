export const success = (res: any, data: any, status = 200) => res.status(status).json({ success: true, data });
export const fail = (res: any, error: any, status = 400) => res.status(status).json({ success: false, error });
