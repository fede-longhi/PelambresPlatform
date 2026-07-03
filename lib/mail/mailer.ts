import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { CourseWelcomeEmail } from "./templates/course-welcome";
import { CourseConfirmationEmail } from "./templates/course-confirmation";
import { PasswordResetEmail } from "./templates/password-reset";

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
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        await transporter.sendMail({
            from: `"Pelambres 3D" <${process.env.GOOGLE_MAIL_USER}>`,
            to,
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