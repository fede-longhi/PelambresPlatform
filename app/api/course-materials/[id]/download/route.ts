import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessCustomer } from '@/lib/auth/permissions';
import { canAccessCourseClassroom } from '@/lib/auth/course-access';
import { fetchCourseMaterialById } from '@/lib/data/course-material-data';
import { fetchCustomerCourseBySlug } from '@/lib/data/customer-course-data';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id: materialId } = await context.params;

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

  const material = await fetchCourseMaterialById(materialId);
  if (!material?.fileUrl) {
    return NextResponse.json({ error: 'Material no encontrado.' }, { status: 404 });
  }

  const course = await fetchCustomerCourseBySlug(
    sessionUser.id,
    sessionUser.email,
    material.courseSlug
  );

  if (
    !course ||
    !canAccessCourseClassroom({
      registrationStatus: course.registrationStatus,
      paymentStatus: course.paymentStatus,
      price: course.price,
    })
  ) {
    return NextResponse.json({ error: 'No tenés acceso a este material.' }, { status: 403 });
  }

  try {
    const fileResponse = await fetch(material.fileUrl);

    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json({ error: 'Archivo no disponible.' }, { status: 404 });
    }

    const encodedFilename = encodeURIComponent(material.filename);

    return new Response(fileResponse.body, {
      headers: {
        'Content-Type': material.mimeType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error streaming course material:', error);
    return NextResponse.json({ error: 'No se pudo descargar el archivo.' }, { status: 500 });
  }
}
