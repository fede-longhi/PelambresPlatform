import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessCustomer } from '@/lib/auth/permissions';
import { fetchPlaceAutocompleteSuggestions } from '@/lib/places/google-places';

export async function POST(request: Request) {
  const session = await auth();
  const sessionUser = session?.user;

  if (
    !sessionUser?.id ||
    !sessionUser.email ||
    !canAccessCustomer({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name ?? '',
      role: sessionUser.role,
      isActive: sessionUser.isActive,
      mustChangePassword: sessionUser.mustChangePassword,
    })
  ) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  let body: { input?: unknown; sessionToken?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const input = typeof body.input === 'string' ? body.input : '';
  const sessionToken =
    typeof body.sessionToken === 'string' ? body.sessionToken.trim() : '';

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'Falta el token de sesión de Places.' },
      { status: 400 }
    );
  }

  try {
    const suggestions = await fetchPlaceAutocompleteSuggestions({
      query: input,
      sessionToken,
    });
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'No se pudieron obtener sugerencias de dirección.' },
      { status: 502 }
    );
  }
}
