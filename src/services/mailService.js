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

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Rent IT!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #4CAF50;">Welcome to Rent IT, ${name}!</h1>
        <p>We are thrilled to have you on board. Rent IT is your one-stop solution for renting anything you need, anytime you need it.</p>
        <p>Explore our platform and discover a wide range of items available for rent. Whether you're looking for tools, vehicles, or gadgets, we've got you covered!</p>
        <p style="margin-top: 20px;">Start exploring now and make the most of your experience with us.</p>
        <a href="https://www.rentit.com" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Explore Rent IT</a>
        <p style="margin-top: 20px;">If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy Renting!</p>
        <p>The Rent IT Team</p>
      </div> `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Welcome email sent to ${email}`);
};
