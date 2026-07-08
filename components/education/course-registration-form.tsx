'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerForCourse, RegistrationFormState } from '@/lib/actions/course-actions';

export type CourseRegistrationSession = {
  name: string;
  email: string;
  existingRegistration?: {
    status: string;
  };
  coursesHref?: string;
};

type CourseRegistrationFormProps = {
  courseId: string;
  sessionUser?: CourseRegistrationSession;
};

function GuestAccountAccessPrompt() {
  const pathname = usePathname();
  const callbackUrl = encodeURIComponent(pathname);
  const loginHref = `/login?callbackUrl=${callbackUrl}`;
  const registerHref = `/register?callbackUrl=${callbackUrl}`;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm">
      <p className="font-medium text-slate-900">¿Ya tenés cuenta en Pelambres?</p>
      <p className="mt-2 text-slate-600">
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Iniciá sesión
        </Link>{' '}
        para inscribirte con tu usuario, o{' '}
        <Link href={registerHref} className="font-medium text-primary hover:underline">
          creá tu cuenta
        </Link>
        .
      </p>
    </div>
  );
}

function RegistrationSuccess({ message }: { message: string | null | undefined }) {
  return (
    <div className="space-y-4 py-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h4 className="text-xl font-bold text-slate-900">¡Inscripción recibida!</h4>
      <p className="text-sm text-slate-500">
        {message || 'Te enviamos un correo con el enlace de confirmación.'}
      </p>
    </div>
  );
}

export function CourseRegistrationForm({ courseId, sessionUser }: CourseRegistrationFormProps) {
  const registerWithId = registerForCourse.bind(null, courseId);
  const initialState: RegistrationFormState = { message: null, errors: {}, success: false };
  const [state, formAction, isPending] = useActionState(registerWithId, initialState);

  if (state.success) {
    return <RegistrationSuccess message={state.message} />;
  }

  if (sessionUser?.existingRegistration) {
    const isConfirmed = sessionUser.existingRegistration.status === 'confirmed';

    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm text-slate-700">
          {isConfirmed
            ? 'Ya estás inscripto a este curso.'
            : 'Ya tenés una inscripción pendiente. Revisá tu correo para confirmarla.'}
        </p>
        {isConfirmed && sessionUser.coursesHref && (
          <Button asChild className="w-full">
            <Link href={sessionUser.coursesHref}>Ir a mis cursos</Link>
          </Button>
        )}
      </div>
    );
  }

  if (sessionUser) {
    return (
      <form action={formAction} className="space-y-4">
        {state.success === false && state.message && (
          <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {state.message}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-900">Te inscribiremos como:</p>
          <p className="mt-2 text-slate-700">{sessionUser.name}</p>
          <p className="text-slate-500">{sessionUser.email}</p>
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={isPending}>
          {isPending ? 'Procesando inscripción...' : 'Inscribirme a este curso'}
        </Button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Te enviaremos un correo de confirmación a tu email.
        </p>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <GuestAccountAccessPrompt />

      {state.success === false && state.message && (
        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
          {state.message}
        </div>
      )}

      <p className="text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        o completá tus datos
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            placeholder="Ej: Juan"
            disabled={isPending}
          />
          {state.errors?.firstName && (
            <p className="mt-1 text-xs text-red-500">{state.errors.firstName[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Ej: Pérez"
            disabled={isPending}
          />
          {state.errors?.lastName && (
            <p className="mt-1 text-xs text-red-500">{state.errors.lastName[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          disabled={isPending}
        />
        {state.errors?.email && (
          <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">WhatsApp (opcional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+54 9 11 1234 5678"
          disabled={isPending}
        />
        {state.errors?.phone && (
          <p className="mt-1 text-xs text-red-500">{state.errors.phone[0]}</p>
        )}
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={isPending}>
        {isPending ? 'Procesando inscripción...' : 'Quiero inscribirme'}
      </Button>

      <p className="mt-4 text-center text-xs text-slate-400">
        Tus datos están seguros y serán utilizados únicamente para este curso.
      </p>
    </form>
  );
}
