import { Hono } from 'hono';
import { StatusError } from '../utils/error';
import { createDbMiddleware } from '../middlewares/db';

const app = new Hono<{ Bindings: Env }>();

const dbMiddleware = createDbMiddleware('material');

app.onError((e, c) => c.text('', e instanceof StatusError ? e.status : 500));

app.put('/', dbMiddleware, async c => {
  const data = await c.req.json();
  const id = await c.var.db.create(data);
  return c.json({ id });
});

app.get('/:id', dbMiddleware, async c => {
  const id = c.req.param('id');
  const data = await c.var.db.get(id);
  return c.json(data);
});

app.put('/:id', dbMiddleware, async c => {
  const id = c.req.param('id');
  const data = await c.req.json();
  await c.var.db.update(id, data);
  return c.text('');
});

export default app;
