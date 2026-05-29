package com.rentova.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailService {

    private static final String RENTOVA_TEMPLATE = "email/rentova-product-highlights.html";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.from:manjubhat8105@gmail.com}")
    private String fromEmail;

    @Value("${app.email.from-name:Rentova}")
    private String fromName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Sends an HTML email asynchronously so it never blocks API responses.
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            System.err.println("[EmailService] JavaMailSender not configured. Skipping email to: " + to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("[EmailService] Email sent to: " + to + " | Subject: " + subject);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send email to: " + to);
            System.err.println("[EmailService] Error type: " + e.getClass().getName());
            System.err.println("[EmailService] Error message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("[EmailService] Root cause: " + e.getCause().getMessage());
            }
        }
    }

    /**
     * Sends account verification OTP email.
     */
    @Async
    public void sendVerificationOtp(String to, String otp) {
        String subject = "Verify your Rentova account - " + otp;
        String html = renderRentovaTemplate(Map.ofEntries(
                Map.entry("preheader", "Your Rentova verification code is " + otp),
                Map.entry("eyebrow", "Secure account verification"),
                Map.entry("headline", "Verify your Rentova email"),
                Map.entry("intro", "Use this one-time code to finish setting up your Rentova account."),
                Map.entry("primaryCtaText", "Open Rentova"),
                Map.entry("primaryCtaUrl", frontendUrl + "/register"),
                Map.entry("secondaryText", "This code is valid for 10 minutes. If you did not request it, you can ignore this email."),
                Map.entry("featureOneTitle", "Your verification code"),
                Map.entry("featureOneBody", "<span class=\"otp-code\">" + escapeHtml(otp) + "</span>"),
                Map.entry("featureTwoTitle", "Secure rentals"),
                Map.entry("featureTwoBody", "Book nearby vendors with wallet-backed payment and verified booking status."),
                Map.entry("featureThreeTitle", "Real-time support"),
                Map.entry("featureThreeBody", "Chat with vendors and track booking updates from your dashboard.")
        ));
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends phone verification OTP email.
     */
    @Async
    public void sendPhoneVerificationOtp(String to, String otp) {
        String subject = "Link your mobile number to Rentova";
        String html = renderRentovaTemplate(Map.ofEntries(
                Map.entry("preheader", "Confirm your phone number with code " + otp),
                Map.entry("eyebrow", "Trust score verification"),
                Map.entry("headline", "Link your mobile number"),
                Map.entry("intro", "Enter this code in Rentova to attach your mobile number to your account."),
                Map.entry("primaryCtaText", "Open Profile"),
                Map.entry("primaryCtaUrl", frontendUrl + "/dashboard/profile"),
                Map.entry("secondaryText", "Phone verification helps customers and vendors transact with more confidence."),
                Map.entry("featureOneTitle", "Your verification code"),
                Map.entry("featureOneBody", "<span class=\"otp-code\">" + escapeHtml(otp) + "</span>"),
                Map.entry("featureTwoTitle", "Higher trust"),
                Map.entry("featureTwoBody", "Verified profiles stand out across marketplace conversations and bookings."),
                Map.entry("featureThreeTitle", "Safer handoffs"),
                Map.entry("featureThreeBody", "Use verified contact details when coordinating service start and completion.")
        ));
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends a booking notification using the Rentova product-highlights email shell.
     */
    @Async
    public void sendBookingNotificationEmail(String to, String subject, String bodyText) {
        String html = renderRentovaTemplate(Map.ofEntries(
                Map.entry("preheader", subject),
                Map.entry("eyebrow", "Booking update"),
                Map.entry("headline", subject),
                Map.entry("intro", escapeHtml(bodyText).replace("\n", "<br>")),
                Map.entry("primaryCtaText", "View booking"),
                Map.entry("primaryCtaUrl", frontendUrl + "/dashboard/bookings"),
                Map.entry("secondaryText", "You can manage status, wallet activity, maps, and chat from your Rentova dashboard."),
                Map.entry("featureOneTitle", "Booking control"),
                Map.entry("featureOneBody", "Confirm, start, complete, or cancel bookings with role-based actions."),
                Map.entry("featureTwoTitle", "Maps and nearby vendors"),
                Map.entry("featureTwoBody", "Coordinate pickup or service delivery with saved customer and vendor locations."),
                Map.entry("featureThreeTitle", "Live chat"),
                Map.entry("featureThreeBody", "Keep customer-vendor communication attached to each booking thread.")
        ));
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends the Rentova product highlights campaign converted from the Brevo builder template.
     */
    @Async
    public void sendProductHighlightsEmail(String to) {
        String subject = "Discover what is new on Rentova";
        String html = renderRentovaTemplate(Map.ofEntries(
                Map.entry("preheader", "Nearby rentals, vendor listings, wallet payments, and admin control."),
                Map.entry("eyebrow", "Rentova product highlights"),
                Map.entry("headline", "Rent smarter with nearby vendors"),
                Map.entry("intro", "Rentova brings customers, vendors, and admins into one marketplace built for trusted local rentals."),
                Map.entry("primaryCtaText", "Explore Rentova"),
                Map.entry("primaryCtaUrl", frontendUrl + "/dashboard"),
                Map.entry("secondaryText", "Use Rentova to discover nearby inventory, publish services, manage bookings, and settle payments."),
                Map.entry("featureOneTitle", "For customers"),
                Map.entry("featureOneBody", "Find services around you, view maps, book with your wallet, and message vendors instantly."),
                Map.entry("featureTwoTitle", "For vendors"),
                Map.entry("featureTwoBody", "List assets with service radius, receive booking requests, and collect payouts after completion."),
                Map.entry("featureThreeTitle", "For admins"),
                Map.entry("featureThreeBody", "Control users, listings, bookings, revenue, and platform trust from a dedicated command center.")
        ));
        sendHtmlEmail(to, subject, html);
    }

    private String renderRentovaTemplate(Map<String, String> values) {
        String html = loadTemplate();
        Map<String, String> defaults = Map.of(
                "mirrorUrl", frontendUrl,
                "facebookUrl", frontendUrl,
                "instagramUrl", frontendUrl,
                "linkedinUrl", frontendUrl,
                "youtubeUrl", frontendUrl,
                "unsubscribeUrl", "{{ unsubscribe }}",
                "contactEmail", fromEmail,
                "contactLocation", "Bangalore, India"
        );

        for (Map.Entry<String, String> entry : defaults.entrySet()) {
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        for (Map.Entry<String, String> entry : values.entrySet()) {
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return html;
    }

    private String loadTemplate() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(RENTOVA_TEMPLATE)) {
            if (input == null) {
                throw new IllegalStateException("Email template not found: " + RENTOVA_TEMPLATE);
            }
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to load email template: " + RENTOVA_TEMPLATE, e);
        }
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
