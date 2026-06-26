import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
    previewText: string;
    children: React.ReactNode;
}

export const BaseLayout = ({ previewText, children }: BaseLayoutProps) => {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-slate-50 my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-slate-200 rounded-lg my-[40px] mx-auto p-[20px] max-w-[600px] bg-white">
                        
                        {/* Header: Logo de Pelambres */}
                        <Section className="mt-[32px] mb-[32px] text-center">
                            {/* Reemplaza esta URL con la URL pública de tu logo en Vercel Blob */}
                            <Img
                                src="https://tu-dominio.com/logo-pelambres.png"
                                width="120"
                                height="40"
                                alt="Pelambres 3D"
                                className="my-0 mx-auto"
                            />
                        </Section>

                        {/* Contenido Dinámico (Acá entra la plantilla específica) */}
                        {children}

                        {/* Footer Reutilizable */}
                        <Hr className="border border-solid border-slate-200 my-[26px] mx-0 w-full" />
                        <Text className="text-slate-500 text-[12px] leading-[24px] text-center">
                            Pelambres 3D - Martínez, Buenos Aires, Argentina. <br />
                            Por favor, no respondas a este correo automatizado.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};