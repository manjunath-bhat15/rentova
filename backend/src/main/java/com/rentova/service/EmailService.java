package com.rentova.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:manjubhat8105@gmail.com}")
    private String fromEmail;

    /**
     * Sends an HTML email asynchronously so it never blocks API responses.
     * Logs success and full exception details on failure.
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            System.err.println("[EmailService] JavaMailSender is not configured. Skipping email to: " + to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Rentova");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("[EmailService] ✅ Email sent successfully to: " + to + " | Subject: " + subject);
        } catch (Exception e) {
            System.err.println("[EmailService] ❌ Failed to send email to: " + to);
            System.err.println("[EmailService] Error type: " + e.getClass().getName());
            System.err.println("[EmailService] Error message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("[EmailService] Root cause: " + e.getCause().getMessage());
            }
        }
    }

    /**
     * Builds a clean white Rentova OTP email template (Swiggy-inspired).
     */
    private String getOtpEmailTemplate(String title, String subtitle, String otp) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta charset=\"utf-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "  <style>" +
                "    * { box-sizing: border-box; margin: 0; padding: 0; }" +
                "    body {" +
                "      background-color: #f5f5f5;" +
                "      color: #1c1c1c;" +
                "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;" +
                "      padding: 48px 16px;" +
                "    }" +
                "    .wrapper { max-width: 480px; margin: 0 auto; }" +
                "    .brand {" +
                "      text-align: center;" +
                "      margin-bottom: 24px;" +
                "    }" +
                "    .brand-name {" +
                "      display: inline-block;" +
                "      font-size: 22px;" +
                "      font-weight: 800;" +
                "      letter-spacing: -0.5px;" +
                "      color: #fc8019;" +
                "    }" +
                "    .card {" +
                "      background: #ffffff;" +
                "      border-radius: 20px;" +
                "      padding: 40px 36px;" +
                "      box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);" +
                "    }" +
                "    .title {" +
                "      font-size: 22px;" +
                "      font-weight: 700;" +
                "      color: #1c1c1c;" +
                "      margin-bottom: 10px;" +
                "      letter-spacing: -0.03em;" +
                "    }" +
                "    .subtitle {" +
                "      font-size: 14px;" +
                "      color: #686b78;" +
                "      margin-bottom: 32px;" +
                "      line-height: 1.6;" +
                "    }" +
                "    .otp-wrapper {" +
                "      text-align: center;" +
                "      background: #fff8f2;" +
                "      border: 1.5px dashed #fc8019;" +
                "      border-radius: 14px;" +
                "      padding: 20px 32px;" +
                "      margin-bottom: 28px;" +
                "    }" +
                "    .otp-label {" +
                "      font-size: 11px;" +
                "      font-weight: 700;" +
                "      text-transform: uppercase;" +
                "      letter-spacing: 0.1em;" +
                "      color: #93959f;" +
                "      margin-bottom: 10px;" +
                "    }" +
                "    .otp-code {" +
                "      font-size: 42px;" +
                "      font-weight: 800;" +
                "      color: #fc8019;" +
                "      letter-spacing: 10px;" +
                "      font-variant-numeric: tabular-nums;" +
                "    }" +
                "    .info {" +
                "      font-size: 12px;" +
                "      color: #93959f;" +
                "      line-height: 1.6;" +
                "      margin-bottom: 28px;" +
                "      text-align: center;" +
                "    }" +
                "    .divider {" +
                "      border: none;" +
                "      border-top: 1px solid #f0f0f0;" +
                "      margin: 0 0 20px;" +
                "    }" +
                "    .footer {" +
                "      font-size: 11px;" +
                "      color: #b0b3c6;" +
                "      line-height: 1.7;" +
                "      text-align: center;" +
                "    }" +
                "    .footer strong { color: #686b78; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class=\"wrapper\">" +
                "    <div class=\"brand\"><span class=\"brand-name\">RENTOVA</span></div>" +
                "    <div class=\"card\">" +
                "      <div class=\"title\">" + title + "</div>" +
                "      <div class=\"subtitle\">" + subtitle + "</div>" +
                "      <div class=\"otp-wrapper\">" +
                "        <div class=\"otp-label\">Your verification code</div>" +
                "        <div class=\"otp-code\">" + otp + "</div>" +
                "      </div>" +
                "      <div class=\"info\">This code is valid for <strong>10 minutes</strong>.<br>If you did not request this, you can safely ignore this email.</div>" +
                "      <hr class=\"divider\">" +
                "      <div class=\"footer\">" +
                "        <strong>Rentova</strong> — Peer-to-Peer Rental Network<br>" +
                "        Trust &bull; Security &bull; Frictionless Assets" +
                "      </div>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Sends account verification OTP email.
     */
    public void sendVerificationOtp(String to, String otp) {
        String subject = "Verify your Rentova Account — " + otp;
        String html = getOtpEmailTemplate(
                "Verify your Email",
                "Thank you for joining Rentova. Use the verification code below to complete your registration and activate your account.",
                otp
        );
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends phone verification OTP email.
     */
    public void sendPhoneVerificationOtp(String to, String otp) {
        String subject = "Link your Mobile Number to Rentova";
        String html = getOtpEmailTemplate(
                "Link Mobile Number",
                "Confirm linking your phone number to Rentova by entering this secure verification code.",
                otp
        );
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends a simple booking notification email (plain text rendered as HTML).
     */
    public void sendBookingNotificationEmail(String to, String subject, String bodyText) {
        String html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>" +
                "body { background:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; padding:40px 16px; }" +
                ".card { background:#fff; border-radius:16px; padding:32px; max-width:480px; margin:0 auto; " +
                "box-shadow:0 4px 20px rgba(0,0,0,0.07); }" +
                ".brand { font-size:18px; font-weight:800; color:#fc8019; margin-bottom:20px; }" +
                "p { color:#686b78; font-size:14px; line-height:1.7; margin-bottom:12px; }" +
                ".footer { font-size:11px; color:#b0b3c6; margin-top:24px; border-top:1px solid #f0f0f0; padding-top:16px; }" +
                "</style></head><body>" +
                "<div class=\"card\">" +
                "<div class=\"brand\">RENTOVA</div>" +
                "<p>" + bodyText.replace("\n", "<br>") + "</p>" +
                "<div class=\"footer\">Rentova — Peer-to-Peer Rental Network</div>" +
                "</div></body></html>";
        sendHtmlEmail(to, subject, html);
    }
}
