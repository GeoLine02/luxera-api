import nodemailer from "nodemailer";

export const getOTPEmailTemplate = (otp: string, userName?: string): string => {
  return `
<!DOCTYPE html>
<html lang="ka">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f8f8;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 0;
            overflow: hidden;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #f5e6e8 0%, #f0dfe2 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 1px solid #e8d5d9;
        }
        
        .logo {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.5px;
            color: #1a1a1a;
            margin: 0;
            font-family: 'Segoe UI', -apple-system, sans-serif;
        }
        
        .header-subtitle {
            font-size: 12px;
            color: #999;
            margin-top: 8px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        /* Main Content */
        .content {
            padding: 50px 40px;
            background-color: #ffffff;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        
        .message {
            font-size: 14px;
            color: #555;
            line-height: 1.8;
            margin-bottom: 35px;
        }
        
        /* OTP Container */
        .otp-section {
            text-align: center;
            margin: 40px 0;
        }
        
        .otp-label {
            font-size: 12px;
            color: #999;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 15px;
            display: block;
        }
        
        .otp-box {
            background: linear-gradient(135deg, #fef5f7 0%, #faf1f3 100%);
            border: 1px solid #e8d5d9;
            border-radius: 4px;
            padding: 30px;
            margin: 20px 0;
            display: inline-block;
            min-width: 280px;
        }
        
        .otp-code {
            font-size: 40px;
            font-weight: 600;
            color: #a88695;
            letter-spacing: 6px;
            font-family: 'Courier New', monospace;
            margin: 0;
            font-kerning: none;
        }
        
        /* Expiry Notice */
        .expiry-section {
            background-color: #fdf9f9;
            border-left: 3px solid #dfc0c9;
            padding: 16px 20px;
            margin: 30px 0;
            border-radius: 2px;
            font-size: 13px;
            color: #666;
        }
        
        .expiry-section strong {
            color: #a88695;
            display: block;
            margin-bottom: 5px;
        }
        
        /* Instructions */
        .instructions {
            background-color: #faf8f8;
            padding: 20px;
            border-radius: 4px;
            margin: 30px 0;
            font-size: 13px;
            color: #555;
            border: 1px solid #eee;
        }
        
        .instructions strong {
            color: #333;
            display: block;
            margin-bottom: 12px;
        }
        
        .instructions ol {
            list-style-position: inside;
            line-height: 1.9;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .instructions li span {
            background-color: #fef5f7;
            padding: 2px 6px;
            border-radius: 2px;
            font-weight: 600;
            color: #a88695;
        }
        
        /* Security Notice */
        .security-notice {
            background-color: #fffbfb;
            border: 1px solid #e8d5d9;
            padding: 14px 16px;
            border-radius: 3px;
            margin: 30px 0;
            font-size: 12px;
            color: #888;
            text-align: center;
        }
        
        .security-icon {
            font-size: 14px;
            margin-right: 6px;
        }
        
        /* Divider */
        .divider {
            height: 1px;
            background-color: #e8d5d9;
            margin: 30px 0;
        }
        
        /* Footer */
        .footer {
            background-color: #f8f8f8;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e8d5d9;
            font-size: 12px;
            color: #999;
        }
        
        .footer-text {
            margin-bottom: 15px;
            line-height: 1.8;
        }
        
        .footer-links {
            font-size: 11px;
            margin-top: 15px;
        }
        
        .footer-links a {
            color: #a88695;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .footer-brand {
            font-weight: 600;
            color: #333;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e8d5d9;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 32px;
                letter-spacing: 4px;
            }
            
            .otp-box {
                min-width: 100%;
                padding: 25px 20px;
            }
            
            .footer {
                padding: 20px;
            }
            
            .greeting {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">Luxera Gift</h1>
            <div class="header-subtitle">ელ-ფოსტის გადამოწმება</div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting">
                ${userName ? `გამარჯობა ${userName}!` : "გამარჯობა!"}
            </div>

            <!-- Message -->
            <div class="message">
                თქვენი Luxera Gift ანგარიშის გადამოწმებისთვის საჭირო ერთჯერადი პაროლი მზად არის. ქვემოთ ნახავთ თქვენი გადამოწმების კოდს.
            </div>

            <!-- OTP Section -->
            <div class="otp-section">
                <span class="otp-label">თქვენი გადამოწმების კოდი</span>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-section">
               
                ეს კოდი ვალიდურია მხოლოდ 10 წუთის განმავლობაში. გთხოვთ, მალე შეიყვანოთ კოდი.
            </div>

            <!-- Instructions -->
            <div class="instructions">
                <strong>როგორ გამოიყენოთ:</strong>
                <ol>
                    <li>გახსენით Luxera Gift აპლიკაცია ან ვებსაიტი</li>
                    <li>დაბრუნდით იმ ადგილას, საიდანაც გამოაგზავნეთ კოდი</span></li>
                    <li>შეიყვანეთ კოდი: <span>${otp}</span></li>
                    <li>დაასრულეთ გადამოწმება</li>
                </ol>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <span class="security-icon">🔒</span>
                ეს კოდი პირადულია - არ გაუზიაროთ სხვას
            </div>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- Additional Message -->
            <div class="message" style="margin-bottom: 0;">
                თუ თქვენ ეს მოთხოვნა არ გააკეთეთ, უგულებელყავით ეს წერილი. თქვენი ანგარიში დაცული დარჩება.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                © 2026 Luxera Gift. ყველა უფლება დაცულია.
            </div>
            
            <div class="footer-links">
                <a href="https://luxeragift.com">ვიზიტი ვებსაიტზე</a>
                <a href="https://luxeragift.com/ka/privacy-and-policy">კონფიდენციალურობა</a>
                <a href="https://luxeragift.com/ka/contact">კონტაქტი</a>
            </div>
            
            <div class="footer-brand">
                Luxera Gift
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(email: string, otp: string) {
  const html = getOTPEmailTemplate(otp);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "luxeragift | ანგარიშის ვერიფიკაცია",

      html: html,
    });
  } catch (error) {
    throw error;
  }
}
