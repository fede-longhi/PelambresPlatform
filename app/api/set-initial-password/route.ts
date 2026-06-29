import { NextResponse } from 'next/server';
import { setInitialPasswordForSession } from '@/lib/auth/set-initial-password-service';

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await setInitialPasswordForSession(formData);
  return NextResponse.json(result);
}
