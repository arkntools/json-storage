import { Hono } from 'hono';
import material from './routers/material';

const app = new Hono<{ Bindings: Env }>();

app.route('/material', material);

export default app;
