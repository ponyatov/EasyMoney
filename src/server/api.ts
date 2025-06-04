import { Hono } from 'hono';
import { db } from './db.ts';

const app = new Hono();

const STYLE = '<style></style>';

// Health check
app.get('/', (c) => c.html(`${STYLE}EasyMoney Deno API`));

// Transaction endpoint
app.post('/transactions', async (c) => {
    const { amount } = await c.req.json<{ amount: number }>();

    db.exec('INSERT INTO transactions (amount) VALUES (?)', [amount]);

    return c.json({
        status: 'success',
        amount,
    });
});

export default app;
