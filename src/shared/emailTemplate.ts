import { ICreateAccount, IResetPassword } from "../types/emailTemplate";

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: "Verify your account",
    html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
                    <!-- Logo -->
                    <img src="https://media.licdn.com/dms/image/v2/C4D12AQHzjltSjxMCgQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1571856429239?e=2147483647&v=beta&t=1YxJZBnRQv7JOPIWHNz1wiW9EQNVcKsEZNikrDildt8" alt="Servi Logo" style="display: block; margin: 0 auto 20px; width:150px" />

                    <!-- Greeting -->
                    <h2 style="color: #D0A933; font-size: 24px; margin-bottom: 20px;">Hey, ${values.name}!</h2>

                    <!-- Verification Instructions -->
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for signing up for Servi. Please verify your email address to activate your account.</p>

                    <!-- OTP Section -->
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #D0A933; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>

                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not sign up for Servi, please ignore this email.</p>
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2024 Servi. All rights reserved.</p>

                </div>
            </body>
        `,
  };

  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: "GO CONNECTE – Password Reset Code",
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 0; background-color: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden;">

          <!-- Header -->
          <div style="background-color:#009e99;padding:25px 20px;color:white;text-align:center">
            <img 
              src="https://res.cloudinary.com/dphkhbunv/image/upload/v1764838083/E4E36157-7B0A-426F-A544-52A5091A7DEB_eueode.jpg" 
              alt="GO CONNECTE Logo"
              style="width:90px;height:auto;margin-bottom:10px;border-radius:8px;"
            />
            <h2 style="margin:0;font-size:24px;font-weight:600;letter-spacing:1px;">
              GO CONNECTE – Password Reset
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:25px;background-color:#ffffff;text-align:center">
            <p style="color:#555;font-size:16px;line-height:1.5;margin-bottom:20px;">
              Your single-use password reset code is:
            </p>

            <div style="
              background-color:#f8fdfd;
              padding:18px 25px;
              border-left:4px solid #009e99;
              border-radius:8px;
              color:#009e99;
              font-size:26px;
              font-weight:700;
              letter-spacing:4px;
              width:140px;
              margin:20px auto;
              text-align:center;
            ">
              ${values.otp}
            </div>

            <p style="color:#555;font-size:16px;line-height:1.5;margin-bottom:20px;">
              This code will expire in 3 minutes.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color:#f5f5f5;padding:18px;text-align:center;
          font-size:12px;color:#666;">
            © ${new Date().getFullYear()} GO CONNECTE. All rights reserved.
          </div>

        </div>
      </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
