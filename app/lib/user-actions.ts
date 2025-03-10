'use server';

import type { User } from '@/app/lib/definitions';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createUser(user: User) {
    console.log(user);
    try {
        const randomPassword = '123456';
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        await sql`
        INSERT INTO users (name, email, password, image_url)
        VALUES (${user.name}, ${user.email}, ${hashedPassword}, ${user.image_url})
        ON CONFLICT (id) DO NOTHING;
        `;
        console.log('user created');
    } catch (error) {
        console.log('error creating user')
        console.log(error)
        return { message: 'Database Error: Failed to Insert User.' };
    }
};

 
export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}