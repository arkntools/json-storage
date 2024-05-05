import { Hono } from 'hono';
import { cors } from 'hono/cors';
import material from './routers/material';
import { Db, DbTableName } from './utils/db';

const app = new Hono<{ Bindings: Env }>();

app.get('/', c => c.body('OK', 200));

app.use('*', async (c, next) => {
  const allowOrigins = c.env.ALLOW_ORIGIN?.split(',') || [];
  if (!c.env.IS_DEV && !allowOrigins.includes(c.req.header('origin') || '*')) {
    return c.body(null, 403);
  }
  return await cors({ origin: c.env.IS_DEV ? 'http://localhost:8080' : allowOrigins, maxAge: 3600 })(c, next);
});

app.route('/material', material);

((app as any).scheduled as ExportedHandlerScheduledHandler<Env>) = async (event, env, ctx) => {
  const db = new Db(env.DB, DbTableName.MATERIAL);
  ctx.waitUntil(db.purge());
};

export default app;
