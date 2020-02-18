const nodeMailer = require("nodemailer");

module.exports = {
    sendEmail: (toUser, subject, textBody) => {
        let transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'shristipahari02@gmail.com',
                pass: 'aaloobhaatmomo0602'
            }
        });
        let mailOptions = {
            to: toUser,
            subject: subject,
            text: textBody
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error(error);
            }
            console.log(`Message ${info.messageId} sent: ${info.response}`);
        });
    }
};
