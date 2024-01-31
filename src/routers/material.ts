import { Hono } from 'hono';
import { Db } from '../utils/db';

const app = new Hono<{ Bindings: Env }>();

app.onError((e, c) => c.text('', 403));

app.put('/', async c => {
  const data = await c.req.json();
  const db = new Db(c.env.DB);
  const id = await db.create(data);
  return c.json({ id });
});

app.get('/:id', async c => {
  const id = c.req.param('id');
  const db = new Db(c.env.DB);
  const data = await db.get(id);
  if (!data) throw new Error();
  return c.json(data);
});

app.put('/:id', async c => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const db = new Db(c.env.DB);
  await db.update(id, data);
  return c.text('');
});

export default app;
