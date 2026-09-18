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
import { PELAMBRES_LOGO_CID } from "./logo";

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
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Img
                                src={`cid:${PELAMBRES_LOGO_CID}`}
                                width="64"
                                height="64"
                                alt="Pelambres 3D"
                                className="my-0 mx-auto"
                            />
                        </Section>

                        {children}

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
