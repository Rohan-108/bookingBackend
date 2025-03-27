import nodemailer from "nodemailer";
/**
 * @description This function makes a transporter object
 */
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @description This function sends an email
 * @param {string} email - The email to send to
 * @param {string} subject - The subject of the email
 * @param {string} message - The message to send
 */
export const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${email}`);
};
