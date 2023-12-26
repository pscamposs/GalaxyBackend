import express from "express";
import { merge } from "lodash";

import { getUserFromSession } from "../db/Users";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["g-auth"];
    if (!sessionToken) return res.sendStatus(403);

    const user = await getUserFromSession(sessionToken);
    if (!user) return res.sendStatus(403);

    merge(req, { identity: user });
    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const hasRole = (roles: string[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const sessionToken = req.cookies["g-auth"];

    if (!sessionToken) return res.sendStatus(403);
    const user = await getUserFromSession(sessionToken).select("+roles");
    if (!user) return res.sendStatus(403);

    let userRoles = user.roles;

    const found: boolean = userRoles.some((r) => roles.includes(r));

    if (!found) return res.sendStatus(403);

    next();
  };
};
