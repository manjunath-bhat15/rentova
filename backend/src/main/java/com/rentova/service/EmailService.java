package com.rentova.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final String TEMPLATE_HIGHLIGHTS = "email/rentova-product-highlights.html";
    private static final String TEMPLATE_OTP = "email/rentova-otp.html";
    private static final String TEMPLATE_NOTIFICATION = "email/rentova-notification.html";
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.email.brevo-api-key:}")
    private String brevoApiKey;

    @Value("${app.email.from:manjubhat8105@gmail.com}")
    private String fromEmail;

    @Value("${app.email.from-name:Rentova}")
    private String fromName;

    @Value("${app.frontend-url:https://rentova.vercel.app}")
    private String frontendUrl;

    /**
     * Sends an HTML email asynchronously via Brevo HTTP API.
     * Uses HTTPS (port 443) which is NOT blocked by Render free tier.
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            System.err.println("[EmailService] ⚠️ Brevo API key not configured. Skipping email to: " + to);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "htmlContent", htmlContent
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    BREVO_API_URL, HttpMethod.POST, request, String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("[EmailService] ✅ Email sent to: " + to + " | Subject: " + subject);
            } else {
                System.err.println("[EmailService] ❌ Brevo API returned: " + response.getStatusCode());
                System.err.println("[EmailService] Response body: " + response.getBody());
            }
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
     * Sends account verification OTP email.
     */
    @Async
    public void sendVerificationOtp(String to, String otp) {
        String subject = "Verify your Rentova account - " + otp;
        String html = renderRentovaTemplate(TEMPLATE_OTP, Map.of(
                "eyebrow", "Secure account verification",
                "headline", "Verify your Rentova email",
                "intro", "Use this one-time code to finish setting up your Rentova account.",
                "otpCode", otp,
                "primaryCtaText", "Open Rentova",
                "primaryCtaUrl", frontendUrl + "/register",
                "secondaryText", "This code is valid for 10 minutes. If you did not request it, you can ignore this email."
        ));
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends phone verification OTP email.
     */
    @Async
    public void sendPhoneVerificationOtp(String to, String otp) {
        String subject = "Link your mobile number to Rentova";
        String html = renderRentovaTemplate(TEMPLATE_OTP, Map.of(
                "eyebrow", "Trust score verification",
                "headline", "Link your mobile number",
                "intro", "Enter this code in Rentova to attach your mobile number to your account.",
                "otpCode", otp,
                "primaryCtaText", "Open Profile",
                "primaryCtaUrl", frontendUrl + "/dashboard/profile",
                "secondaryText", "Phone verification helps customers and vendors transact with more confidence."
        ));
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends a booking notification using the Rentova product-highlights email shell.
     */
    @Async
    public void sendBookingNotificationEmail(String to, String subject, String bodyText) {
        String html = renderRentovaTemplate(TEMPLATE_NOTIFICATION, Map.of(
                "eyebrow", "Booking update",
                "headline", subject,
                "intro", escapeHtml(bodyText).replace("\n", "<br>"),
                "primaryCtaText", "View booking",
                "primaryCtaUrl", frontendUrl + "/dashboard/bookings",
                "secondaryText", "You can manage status, wallet activity, maps, and chat from your Rentova dashboard."
        ));
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Sends the Rentova product highlights campaign converted from the Brevo builder template.
     */
    @Async
    public void sendProductHighlightsEmail(String to) {
        String subject = "Discover what is new on Rentova";
        String html = renderRentovaTemplate(TEMPLATE_HIGHLIGHTS, Map.ofEntries(
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

    private String renderRentovaTemplate(String templatePath, Map<String, String> values) {
        String html = loadTemplate(templatePath);
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

    private String loadTemplate(String templatePath) {
        try (InputStream input = new ClassPathResource(templatePath).getInputStream()) {
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to load email template: " + templatePath, e);
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
