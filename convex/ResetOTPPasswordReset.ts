import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";
 
 
export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: 'alioneclout7@gmail.com',
        subject: `Reset your password in My App`,
        text: "Your password reset code is " + token,
    });
 
    if (error) {
      throw new Error("Could not send");
    }
  },
});

// export const sendVerificationEmailVerifier = Resend({
//   id: "email-verification",
//   apiKey: process.env.AUTH_RESEND_KEY,
//   async generateVerificationToken() {
//     return generateRandomString(8, alphabet("0-9"));
//   },

//   async sendVerificationRequest({ identifier: email, provider, token }) {
//     const resend = new ResendAPI(provider.apiKey);
//     const verificationLink = `http://localhost:5173/verify-email?token=${args.token}`;

//     const { error } = await resend.emails.send({
//         from: "onboarding@resend.dev",
//         to: 'alioneclout7@gmail.com',
//         subject: "Verify your email address",
//         html: `
//           <h1>Verify your email address</h1>
//           <p>Click the link below to verify your email:</p>
//           <a href="${verificationLink}">Verify Email</a>
//           <p>This link will expire in 24 hours.</p>
//         `,
//     });
 
//     if (error) {
//       throw new Error("Could not send");
//     }
//   },
// });