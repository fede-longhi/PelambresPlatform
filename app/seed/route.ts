import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedQuoteRequests() {
    await sql`
        CREATE TABLE IF NOT EXISTS quote_requests (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255),
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            email TEXT NOT NULL,
            phone VARCHAR(255),
            detail TEXT,
            date DATE NOT NULL
        );
    `;
}

async function seedQuoteRequestsAttachments() {
    await sql`
        CREATE TABLE IF NOT EXISTS quote_request_attachments (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            file_url TEXT NOT NULL,
            quote_request_id UUID NOT NULL,
            FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE
        );
    `;
}

async function seedCustomers() {
    await sql`
        CREATE TABLE IF NOT EXISTS customers (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255),
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            email TEXT NOT NULL,
            phone VARCHAR(255),
            type VARCHAR(255) NOT NULL
        )
    `;
}

async function seedOrders() {
    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            status VARCHAR(255) NOT NULL,
            customer_id UUID NOT NULL,
            tracking_code VARCHAR(255),
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            delivered_date TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
        );
    `;
}

async function seedPrints() {
    await sql`
        CREATE TABLE IF NOT EXISTS prints (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            gcodeName TEXT,
            fileNames TEXT,
            status VARCHAR(255) NOT NULL,
            order_id UUID,
            started_at TIMESTAMP,
            finished_at TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
        );
    `;
}

export async function GET() {
  try {
    await sql.begin(() => [
        seedQuoteRequests(),
        seedQuoteRequestsAttachments(),
        seedCustomers(),
        seedOrders(),
        seedPrints(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
