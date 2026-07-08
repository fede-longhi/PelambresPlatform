export function getDuplicateCourseRegistrationMessage(registrationStatus: string): string {
  if (registrationStatus === 'confirmed') {
    return 'Ya hay una inscripción confirmada para este curso con este email.';
  }

  return 'Este email ya tiene una inscripción pendiente en este curso. Revisá tu correo para confirmarla.';
}

export const PROVISIONAL_ACCOUNT_LOGIN_MESSAGE =
  'Este email ya se usó para inscribirte a un curso. Creá tu contraseña en "Creá tu cuenta" para activar el acceso a la plataforma.';

export const EXISTING_PLATFORM_ACCOUNT_REGISTER_MESSAGE =
  'Ya existe una cuenta de cliente con ese email. Iniciá sesión o usá Google.';
