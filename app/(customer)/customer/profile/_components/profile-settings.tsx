'use client';

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import {
  updateOwnProfile,
  updateOwnProfileImage,
  type OwnProfileFormState,
} from '@/lib/actions/user-actions';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { useToast } from '@/hooks/use-toast';
import ChangePasswordForm from '@/app/(admin)/admin/profile/_components/change-password-form';
import { AddressAutocomplete } from '@/components/shared/address-autocomplete';
import { getUserDisplayName } from '@/lib/utils';
import { formatShortAddress } from '@/lib/places/address-format';
import { Camera, KeyRound, Pencil, X } from 'lucide-react';

export type ProfileSettingsProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  imageUrl: string | null;
  customerType: 'business' | 'person';
  businessName: string | null;
  hasExistingPassword: boolean;
};

function ReadField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:items-center sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="min-h-10 rounded-md border border-transparent bg-muted/40 px-3 py-2 text-sm">
        {value || '—'}
      </dd>
    </div>
  );
}

export default function ProfileSettings({
  firstName,
  lastName,
  email,
  phone,
  address,
  imageUrl,
  customerType,
  businessName,
  hasExistingPassword,
}: ProfileSettingsProps) {
  const { toast } = useToast();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [addressValue, setAddressValue] = useState(address);
  const [isUploadingAvatar, startAvatarTransition] = useTransition();

  const initialState: OwnProfileFormState = { message: null, success: false };
  const [state, formAction, isPending] = useActionState(updateOwnProfile, initialState);

  const displayName = getUserDisplayName({
    first_name: firstName,
    last_name: lastName,
  });

  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    setAddressValue(address);
  }, [address]);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se guardaron correctamente.',
        variant: 'success',
      });
      setIsEditing(false);
    }
  }, [state.message, toast]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    startAvatarTransition(async () => {
      const result = await updateOwnProfileImage(formData);

      if (result.success && result.imageUrl) {
        setCurrentImageUrl(result.imageUrl);
        toast({
          title: 'Foto actualizada',
          description: 'Tu foto de perfil se guardó correctamente.',
          variant: 'success',
        });
        return;
      }

      toast({
        title: 'No se pudo actualizar la foto',
        description: result.message ?? 'Intentá de nuevo.',
        variant: 'destructive',
      });
    });
  }

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="profile-details-heading"
        className="rounded-lg border bg-white p-5 sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="profile-details-heading" className="text-lg font-semibold">
              Tus datos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Información de tu cuenta y del cliente vinculado.
            </p>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Editar
            </Button>
          )}
        </div>

        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <UserAvatar
            imageUrl={currentImageUrl}
            displayName={displayName || email}
            size="xl"
            fallbackClassName="bg-primary/10 text-primary"
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Foto de perfil</p>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-2 size-4" aria-hidden="true" />
              {isUploadingAvatar
                ? 'Subiendo...'
                : currentImageUrl
                  ? 'Cambiar foto'
                  : 'Agregar foto'}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 2 MB.</p>
          </div>
        </div>

        {isEditing ? (
          <form action={formAction} className="space-y-4">
            {!state.success && state.message && state.message !== 'success' && (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-first-name">Nombre</Label>
                <Input
                  id="profile-first-name"
                  name="firstName"
                  defaultValue={firstName}
                  required
                  autoComplete="given-name"
                  aria-invalid={!!state.errors?.firstName}
                  aria-describedby="profile-first-name-error"
                />
                <FieldErrorDisplay
                  id="profile-first-name-error"
                  errors={state.errors?.firstName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-last-name">Apellido</Label>
                <Input
                  id="profile-last-name"
                  name="lastName"
                  defaultValue={lastName}
                  autoComplete="family-name"
                  aria-invalid={!!state.errors?.lastName}
                  aria-describedby="profile-last-name-error"
                />
                <FieldErrorDisplay
                  id="profile-last-name-error"
                  errors={state.errors?.lastName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={email}
                disabled
                readOnly
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Teléfono</Label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                defaultValue={phone}
                autoComplete="tel"
                aria-invalid={!!state.errors?.phone}
                aria-describedby="profile-phone-error"
              />
              <FieldErrorDisplay id="profile-phone-error" errors={state.errors?.phone} />
            </div>

            <AddressAutocomplete
              id="profile-address"
              name="address"
              value={addressValue}
              onChange={setAddressValue}
              aria-invalid={!!state.errors?.address}
              errorId="profile-address-error"
            />
            <FieldErrorDisplay id="profile-address-error" errors={state.errors?.address} />

            {customerType === 'business' && (
              <div className="space-y-2">
                <Label htmlFor="profile-business-name">Empresa</Label>
                <Input
                  id="profile-business-name"
                  value={businessName || '—'}
                  disabled
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setAddressValue(address);
                  setIsEditing(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-3">
            <ReadField label="Nombre" value={firstName} />
            <ReadField label="Apellido" value={lastName} />
            <ReadField label="Email" value={email} />
            <ReadField label="Teléfono" value={phone.trim() ? phone : '—'} />
            <ReadField
              label="Dirección"
              value={address.trim() ? formatShortAddress(address) : '—'}
            />
            {customerType === 'business' && (
              <ReadField label="Empresa" value={businessName || '—'} />
            )}
          </dl>
        )}
      </section>

      <section aria-labelledby="profile-security-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="profile-security-heading" className="text-lg font-semibold">
              Seguridad
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasExistingPassword
                ? 'Podés cambiar la contraseña de tu cuenta.'
                : 'Agregá una contraseña para ingresar también con email.'}
            </p>
          </div>
          {!showPasswordForm && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowPasswordForm(true)}
            >
              <KeyRound className="mr-2 size-4" aria-hidden="true" />
              {hasExistingPassword ? 'Cambiar contraseña' : 'Establecer contraseña'}
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordForm(false)}
              >
                <X className="mr-1 size-4" aria-hidden="true" />
                Cerrar
              </Button>
            </div>
            <ChangePasswordForm
              hasExistingPassword={hasExistingPassword}
              onSuccess={() => setShowPasswordForm(false)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
