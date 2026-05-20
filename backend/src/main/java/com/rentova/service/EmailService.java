package com.rentova.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("admin.rentova@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email to " + to + ": " + e.getMessage());
        }
    }

    private String getOtpEmailTemplate(String title, String subtitle, String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset=\"utf-8\">" +
                "  <style>" +
                "    body {" +
                "      background-color: #0f0f0f;" +
                "      color: #fafafa;" +
                "      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;" +
                "      margin: 0;" +
                "      padding: 40px 20px;" +
                "    }" +
                "    .container {" +
                "      max-width: 460px;" +
                "      margin: 0 auto;" +
                "      background: #1a1a1a;" +
                "      border: 1px solid rgba(255, 255, 255, 0.05);" +
                "      border-radius: 16px;" +
                "      padding: 40px;" +
                "      text-align: center;" +
                "      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);" +
                "    }" +
                "    .logo {" +
                "      font-size: 26px;" +
                "      font-weight: 800;" +
                "      color: #ff7a00;" +
                "      margin-bottom: 24px;" +
                "      letter-spacing: -0.5px;" +
                "    }" +
                "    .title {" +
                "      font-size: 20px;" +
                "      font-weight: 700;" +
                "      color: #fafafa;" +
                "      margin-bottom: 8px;" +
                "    }" +
                "    .subtitle {" +
                "      font-size: 14px;" +
                "      color: #9ca3af;" +
                "      margin-bottom: 32px;" +
                "      line-height: 1.5;" +
                "    }" +
                "    .otp-card {" +
                "      background: rgba(255, 122, 0, 0.05);" +
                "      border: 1px solid rgba(255, 122, 0, 0.2);" +
                "      border-radius: 12px;" +
                "      padding: 16px 32px;" +
                "      margin-bottom: 32px;" +
                "      display: inline-block;" +
                "    }" +
                "    .otp-code {" +
                "      font-size: 38px;" +
                "      font-weight: 800;" +
                "      color: #ff7a00;" +
                "      letter-spacing: 6px;" +
                "      margin: 0;" +
                "    }" +
                "    .info {" +
                "      font-size: 12px;" +
                "      color: #6b7280;" +
                "      margin-bottom: 32px;" +
                "      line-height: 1.5;" +
                "    }" +
                "    .footer {" +
                "      font-size: 11px;" +
                "      color: #4b5563;" +
                "      margin-top: 32px;" +
                "      line-height: 1.6;" +
                "      border-top: 1px solid rgba(255, 255, 255, 0.05);" +
                "      padding-top: 20px;" +
                "    }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class=\"container\">" +
                "    <div class=\"logo\">RENTOVA</div>" +
                "    <div class=\"title\">" + title + "</div>" +
                "    <div class=\"subtitle\">" + subtitle + "</div>" +
                "    <div class=\"otp-card\">" +
                "      <h1 class=\"otp-code\">" + otp + "</h1>" +
                "    </div>" +
                "    <div class=\"info\">" +
                "      This code is valid for 10 minutes. If you did not request this, please secure your account." +
                "    </div>" +
                "    <div class=\"footer\">" +
                "      Rentova Peer-to-Peer Rental Network<br>" +
                "      Trust • Security • Frictionless Assets" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    public void sendVerificationOtp(String to, String otp) {
        String subject = "Verify your Rentova Account";
        String html = getOtpEmailTemplate(
                "Verify your Email",
                "Thank you for registering. Use the secure authorization code below to complete your registration.",
                otp
        );
        sendHtmlEmail(to, subject, html);
    }

    public void sendPhoneVerificationOtp(String to, String otp) {
        String subject = "Link your Mobile Number to Rentova";
        String html = getOtpEmailTemplate(
                "Link Mobile Number",
                "Confirm linking your phone number to Rentova by entering this secure verification code.",
                otp
        );
        sendHtmlEmail(to, subject, html);
    }
}
