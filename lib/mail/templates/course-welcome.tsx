import * as React from "react";
import { Text, Section, Button } from "@react-email/components";
import { BaseLayout } from "../base-layout";

interface CourseWelcomeEmailProps {
    studentName: string;
    courseName: string;
    courseDate?: string | null;
}

export const CourseWelcomeEmail = ({
    studentName,
    courseName,
    courseDate,
}: CourseWelcomeEmailProps) => {
    return (
        <BaseLayout previewText={`¡Bienvenido al curso ${courseName}!`}>
            <Section>
                <Text className="text-slate-800 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                    ¡Hola <strong>{studentName}</strong>!
                </Text>
                
                <Text className="text-slate-700 text-[14px] leading-[24px]">
                    Tu inscripción al curso <strong>{courseName}</strong> ha sido registrada con éxito en nuestra plataforma.
                </Text>

                {courseDate && (
                    <Text className="text-slate-700 text-[14px] leading-[24px]">
                        🗓 <strong>Fecha de inicio:</strong> {courseDate}
                    </Text>
                )}

                <Text className="text-slate-700 text-[14px] leading-[24px]">
                    Nos pondremos en contacto contigo a la brevedad para enviarte los detalles de pago y el acceso. Si tienes alguna duda, puedes contactarnos por nuestros canales habituales.
                </Text>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                        href="https://tu-dominio.com"
                    >
                        Ir a la plataforma
                    </Button>
                </Section>
            </Section>
        </BaseLayout>
    );
};