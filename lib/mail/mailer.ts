import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { CourseWelcomeEmail } from "./templates/course-welcome";
import { CourseConfirmationEmail } from "./templates/course-confirmation";
import { PasswordResetEmail } from "./templates/password-reset";
import { QuoteDocumentEmail } from "./templates/quote-document-email";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_MAIL_USER,
        pass: process.env.GOOGLE_MAIL_PASSWORD,
    },
});

type SendEmailOptions = {
    to: string;
    subject: string;
    html: string;
    cc?: string;
};

export async function sendEmail({ to, subject, html, cc }: SendEmailOptions) {
    try {
        await transporter.sendMail({
            from: `"Pelambres 3D" <${process.env.GOOGLE_MAIL_USER}>`,
            to,
            cc,
            subject,
            html,
        });
        console.log(`Email enviado a ${to}`);
    } catch (error) {
        console.error("Error enviando email:", error);
        throw new Error("No se pudo enviar el correo");
    }
}

export async function sendCourseWelcomeEmail(to: string, studentName: string, courseName: string, courseDate?: string | null) {
    const emailHtml = await render(
        CourseWelcomeEmail({ studentName, courseName, courseDate })
    );

    await sendEmail({
        to,
        subject: `Inscripción confirmada: ${courseName}`,
        html: emailHtml,
    });
}

export async function sendCourseConfirmationEmail(
    to: string, 
    studentName: string, 
    courseName: string,
    courseSlug: string, 
    token: string
) {
    try {
        console.log(`Enviando email de confirmación del curso a ${to} para el curso ${courseName} con token ${token}`);
        const emailHtml = await render(
            CourseConfirmationEmail({ studentName, courseName, courseSlug, token })
        );
    
        await transporter.sendMail({
            from: `"Pelambres 3D" <${process.env.GOOGLE_MAIL_USER}>`,
            to,
            subject: `Confirma tu inscripción: ${courseName}`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Error enviando email de confirmación del curso:", error);
        throw new Error("No se pudo enviar el correo de confirmación del curso");
    }

}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  roleLabel: string,
  resetToken: string
) {
  const emailHtml = await render(
    PasswordResetEmail({ userName, roleLabel, resetToken })
  );

  await sendEmail({
    to,
    subject: 'Restablecé tu contraseña — Pelambres 3D',
    html: emailHtml,
  });
}

export async function sendQuoteDocumentEmail(input: {
  to: string;
  clientName: string;
  quoteNumber: string;
  quoteDate: string;
  items: { description: string; quantity: string; lineTotal: string }[];
  subtotal: string;
  taxes: string;
  total: string;
  notes?: string;
}) {
  const emailHtml = await render(
    QuoteDocumentEmail({
      clientName: input.clientName,
      quoteNumber: input.quoteNumber,
      quoteDate: input.quoteDate,
      items: input.items,
      subtotal: input.subtotal,
      taxes: input.taxes,
      total: input.total,
      notes: input.notes,
    })
  );

  await sendEmail({
    to: input.to,
    cc: 'contacto@pelambres.com.ar',
    subject: `Presupuesto ${input.quoteNumber} — Pelambres 3D`,
    html: emailHtml,
  });
}