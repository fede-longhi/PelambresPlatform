import { Text, Section, Button } from '@react-email/components';
import { BaseLayout } from '../base-layout';

interface PasswordResetEmailProps {
  userName: string;
  resetToken: string;
  roleLabel: string;
}

export const PasswordResetEmail = ({
  userName,
  resetToken,
  roleLabel,
}: PasswordResetEmailProps) => {
  const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/login/reset-password/${resetToken}`;

  return (
    <BaseLayout previewText="Restablecé tu contraseña en Pelambres 3D">
      <Section>
        <Text className="mx-0 my-[30px] p-0 text-center text-[22px] font-normal text-slate-800">
          Hola <strong>{userName}</strong>
        </Text>

        <Text className="text-[14px] leading-[24px] text-slate-700">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta de{' '}
          <strong>{roleLabel}</strong> en Pelambres 3D.
        </Text>

        <Text className="mb-[24px] text-[14px] leading-[24px] text-slate-700">
          El enlace vence en 1 hora. Si no solicitaste este cambio, podés ignorar este correo.
        </Text>

        <Section className="mb-[32px] mt-[32px] text-center">
          <Button
            className="rounded bg-blue-600 px-6 py-3 text-center text-[14px] font-semibold text-white no-underline"
            href={resetLink}
          >
            Restablecer contraseña
          </Button>
        </Section>

        <Text className="text-[12px] leading-[20px] text-slate-500">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:
          <br />
          <span className="break-all text-blue-500">{resetLink}</span>
        </Text>
      </Section>
    </BaseLayout>
  );
};
