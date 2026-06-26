// src/lib/mail/templates/course-confirmation.tsx
import { Text, Section, Button } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../base-layout";

interface CourseConfirmationEmailProps {
    studentName: string;
    courseName: string;
    token: string;
    courseSlug: string;
}

export const CourseConfirmationEmail = ({
    studentName,
    courseName,
    token,
    courseSlug,
}: CourseConfirmationEmailProps) => {
    const baseUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";
    const confirmationLink = `${baseUrl}/education/${courseSlug}/confirmation/${token}`;

    return (
        <BaseLayout previewText={`Confirma tu inscripción a ${courseName}`}>
            <Section>
                <Text className="text-slate-800 text-[22px] font-normal text-center p-0 my-[30px] mx-0">
                    ¡Hola <strong>{studentName}</strong>!
                </Text>
                
                <Text className="text-slate-700 text-[14px] leading-[24px]">
                    Te has anotado para participar en la capacitación de <strong>{courseName}</strong> en Pelambres 3D. 
                </Text>

                <Text className="text-slate-700 text-[14px] leading-[24px] mb-[24px]">
                    Para verificar tu correo electrónico y reservar formalmente tu lugar, por favor haz clic en el siguiente botón de confirmación:
                </Text>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-blue-600 rounded text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                        href={confirmationLink}
                    >
                        Confirmar mi Inscripción
                    </Button>
                </Section>

                <Text className="text-slate-500 text-[12px] leading-[20px]">
                    Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:<br />
                    <span className="text-blue-500 break-all">{confirmationLink}</span>
                </Text>
            </Section>
        </BaseLayout>
    );
};