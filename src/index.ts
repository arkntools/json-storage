import { Hono } from 'hono';
import material from './routers/material';
import { Db, DbTableName } from './utils/db';

const app = new Hono<{ Bindings: Env }>();

app.route('/material', material);

((app as any).scheduled as ExportedHandlerScheduledHandler<Env>) = async (event, env, ctx) => {
  const db = new Db(env.DB, DbTableName.MATERIAL);
  ctx.waitUntil(db.purge());
};

export default app;
