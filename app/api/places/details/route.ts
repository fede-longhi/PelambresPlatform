import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessCustomer } from '@/lib/auth/permissions';
import { fetchPlaceAddressDetails } from '@/lib/places/google-places';

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

  let body: { placeId?: unknown; sessionToken?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const placeId = typeof body.placeId === 'string' ? body.placeId.trim() : '';
  const sessionToken =
    typeof body.sessionToken === 'string' ? body.sessionToken.trim() : '';

  if (!placeId || !sessionToken) {
    return NextResponse.json(
      { error: 'Faltan placeId o sessionToken.' },
      { status: 400 }
    );
  }

  try {
    const placeAddress = await fetchPlaceAddressDetails({
      placeId,
      sessionToken,
    });

    if (!placeAddress) {
      return NextResponse.json(
        { error: 'No se encontró la dirección.' },
        { status: 404 }
      );
    }

    return NextResponse.json(placeAddress);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'No se pudo obtener la dirección seleccionada.' },
      { status: 502 }
    );
  }
}
