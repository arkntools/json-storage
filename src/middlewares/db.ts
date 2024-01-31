import { Db } from '../utils/db';
import type { MiddlewareHandler } from 'hono';

export const createDbMiddleware: (tableName: string) => MiddlewareHandler<{
  Bindings: Env;
  Variables: { db: Db };
}> = (tableName: string) => async (c, next) => {
  c.set('db', new Db(c.env.DB, tableName));
  await next();
};
