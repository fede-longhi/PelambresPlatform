export type CourseRegistrationAccess = {
  registrationStatus: string;
  paymentStatus: string;
};

export function canAccessCourseClassroom(
  registration: CourseRegistrationAccess,
  coursePrice: number
): boolean {
  if (registration.registrationStatus !== 'confirmed') {
    return false;
  }

  const numericPrice = Number(coursePrice);

  if (numericPrice > 0) {
    return registration.paymentStatus === 'paid';
  }

  return true;
}

export function getCourseAccessMessage(
  registration: CourseRegistrationAccess,
  coursePrice: number
): string {
  if (registration.registrationStatus === 'pending') {
    return 'Confirmá tu inscripción desde el enlace que te enviamos por email para acceder al aula.';
  }

  if (registration.registrationStatus === 'cancelled') {
    return 'Tu inscripción a este curso fue cancelada.';
  }

  const numericPrice = Number(coursePrice);

  if (numericPrice > 0 && registration.paymentStatus !== 'paid') {
    if (registration.paymentStatus === 'partial') {
      return 'Tu pago está parcialmente registrado. Cuando se confirme el pago total vas a poder acceder al aula.';
    }

    return 'El acceso al aula se habilita una vez confirmado el pago del curso.';
  }

  return '';
}
