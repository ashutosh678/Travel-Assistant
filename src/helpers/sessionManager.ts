import { Request, Response } from "express";

export function getSession(req: Request): any {
	return req.cookies.session ? JSON.parse(req.cookies.session) : {};
}

export function storeSession(res: Response, session: any): void {
	res.cookie("session", JSON.stringify(session), { httpOnly: true });
}

export function clearSession(res: Response): void {
	const session = {};
	res.cookie("session", JSON.stringify(session), { httpOnly: true });
	console.log("Session cleared.");
}
