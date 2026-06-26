import { Section } from "@react-email/components";
import { BaseLayout } from "../base-layout";

interface BroadcastEmailProps {
    subject: string;
    message: string;
}

export const BroadcastEmail = ({ subject, message }: BroadcastEmailProps) => {
    return (
        <BaseLayout previewText={subject}>
            <Section>
                <div 
                    className="text-slate-700 text-[15px] leading-[26px] prose prose-slate"
                    dangerouslySetInnerHTML={{ __html: message }} 
                />
            </Section>
        </BaseLayout>
    );
};