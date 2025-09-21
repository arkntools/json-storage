import { Hono } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import { createDbMiddleware, DbTableName } from '../utils/db';
import { StatusError } from '../utils/error';
import { materialValidatorMiddleware } from '../utils/validate';

const app = new Hono<{ Bindings: Env }>();

const dbMiddleware = createDbMiddleware(DbTableName.MATERIAL);

app.onError((e, c) => c.body(null, e instanceof StatusError ? (e.status as StatusCode) : 500));

app.post('/', dbMiddleware, materialValidatorMiddleware, async c => {
  const data = c.req.valid('json');
  const id = await c.var.db.create(data);
  return c.json({ id });
});

app.get('/:id', dbMiddleware, async c => {
  const id = c.req.param('id');
  const data = await c.var.db.get(id);
  return c.json(data);
});

app.put('/:id', dbMiddleware, materialValidatorMiddleware, async c => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  await c.var.db.update(id, data);
  return c.body(null, 204);
});

export default app;
