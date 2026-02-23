const { transporter } = require("../Config/Transporter.config");

const SendVerifyEmail = async (email, token) => {
    try {
        if (!email || !token) {
            throw new Error("Email and token are required");
        }

        const url = `${process.env.BACKEND_URL}/user/verify/${token}`;
        
        const mailOptions = {
            from: `Support Team <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Email Verification",
            html: `
            <div style="background-color: #f4f4f4; padding: 40px 0; font-family: sans-serif; text-align: center;">
                <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #eeeeee; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 50px; margin-bottom: 20px;">✉️</div>
                    <h1 style="color: #333333; font-size: 24px; margin-bottom: 10px;">Verify Your Email</h1>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        Shukriya hamare sath jurne ka! Account active karne ke liye niche diye gaye button par click karein.
                    </p>
                    <a href="${url}" 
                       style="display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                       Verify Account
                    </a>
                    <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                        <p style="color: #999999; font-size: 12px;">Agar aapne yeh request nahi ki, toh is email ko ignore karein.</p>
                    </div>
                </div>
            </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", email, "Message ID:", info.messageId);
        return { success: true, message: "Email sent successfully" };
        
    } catch (error) {
        console.error("Email sending failed:", error.message);
        return { 
            success: false, 
            message: `Email sending failed: ${error.message}`,
            error: error
        };
    }
};

module.exports = { SendVerifyEmail };