package com.resumeintel.infrastructure.parser;

import com.resumeintel.config.AppProperties;
import com.resumeintel.domain.enums.ResumeFileType;
import com.resumeintel.domain.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AtsScannerService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile(
            "(?i)linkedin\\.com/in/[\\w-]+);
    private static final Pattern GITHUB_PATTERN = Pattern.compile(
            "(?i)github\\.com/[\\w-]+");

    private final AppProperties appProperties;

    public java.util.Map<String, Object> scanResume(String resumeText, Path filePath, ResumeFileType fileType) {
        if (resumeText == null) {
            resumeText = "";
        }

        String normalizedText = resumeText.trim();
        int wordCount = normalizedText.isEmpty() ? 0 : normalizedText.split("\\s+").length;
        int lineCount = normalizedText.isEmpty() ? 0 : normalizedText.split("\\n").length;
        int bulletCount = countBullets(normalizedText);

        boolean hasEmail = EMAIL_PATTERN.matcher(normalizedText).find();
        boolean hasPhone = PHONE_PATTERN.matcher(normalizedText).find();
        boolean hasLinkedIn = LINKEDIN_PATTERN.matcher(normalizedText).find();
        boolean hasGitHub = GITHUB_PATTERN.matcher(normalizedText).find();

        boolean hasTables = normalizedText.contains("\t") || normalizedText.matches("(?s).*\\|.*\\|.*");
        boolean hasColumns = lineCount > 0 && wordCount / Math.max(lineCount, 1) < 5;
        boolean hasImages = fileType == ResumeFileType.PDF && containsImages(filePath);
        boolean hasHeadersFooters = normalizedText.toLowerCase().contains("page ") &&
                normalizedText.toLowerCase().contains(" of ");

        int contactScore = scoreContactInfo(hasEmail, hasPhone, hasLinkedIn, hasGitHub);
        int formatScore = scoreFormatting(hasTables, hasColumns, hasImages, bulletCount, wordCount);
        int structureScore = scoreStructure(bulletCount, lineCount, wordCount);
        int atsScore = (contactScore + formatScore + structureScore) / 3;

        return java.util.Map.of(
                "atsScore", atsScore,
                "contactInfo", java.util.Map.of(
                        "hasEmail", hasEmail,
                        "hasPhone", hasPhone,
                        "hasLinkedIn", hasLinkedIn,
                        "hasGitHub", hasGitHub,
                        "score", contactScore
                ),
                "formatting", java.util.Map.of(
                        "hasTables", hasTables,
                        "hasColumns", hasColumns,
                        "hasImages", hasImages,
                        "hasHeadersFooters", hasHeadersFooters,
                        "bulletPointCount", bulletCount,
                        "wordCount", wordCount,
                        "lineCount", lineCount,
                        "estimatedPageCount", Math.max(1, wordCount / 400),
                        "score", formatScore
                ),
                "structure", java.util.Map.of(
                        "bulletPointCount", bulletCount,
                        "hasHiddenText", false,
                        "score", structureScore
                ),
                "recommendations", buildRecommendations(hasEmail, hasPhone, hasLinkedIn, hasTables, hasImages, bulletCount)
        );
    }

    private int countBullets(String text) {
        String[] lines = text.split("\n");
        int count = 0;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")
                    || trimmed.matches("^\\d+\\.\\s+.*")) {
                count++;
            }
        }
        return count;
    }

    private boolean containsImages(Path filePath) {
        if (filePath == null || !Files.exists(filePath)) {
            return false;
        }
        try {
            byte[] bytes = Files.readAllBytes(filePath);
            try (org.apache.pdfbox.pdmodel.PDDocument doc = org.apache.pdfbox.Loader.loadPDF(bytes)) {
                for (org.apache.pdfbox.pdmodel.PDPage page : doc.getPages()) {
                    try {
                        if (page.getResources().getXObjectNames().iterator().hasNext()) {
                            return true;
                        }
                    } catch (Exception e) {
                        // Ignore and continue scanning other pages.
                    }
                }
                return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private int scoreContactInfo(boolean email, boolean phone, boolean linkedin, boolean github) {
        int score = 0;
        if (email) score += 30;
        if (phone) score += 25;
        if (linkedin) score += 25;
        if (github) score += 20;
        return Math.min(100, score);
    }

    private int scoreFormatting(boolean tables, boolean columns, boolean images, int bullets, int words) {
        int score = 100;
        if (tables) score -= 20;
        if (columns) score -= 15;
        if (images) score -= 25;
        if (bullets < 5) score -= 10;
        if (words < 200) score -= 15;
        if (words > 1200) score -= 10;
        return Math.max(0, score);
    }

    private int scoreStructure(int bullets, int lines, int words) {
        int score = 70;
        if (bullets >= 10) score += 15;
        if (lines >= 20 && lines <= 80) score += 10;
        if (words >= 300 && words <= 900) score += 5;
        return Math.min(100, score);
    }

    private java.util.List<String> buildRecommendations(boolean email, boolean phone, boolean linkedin,
                                                         boolean tables, boolean images, int bullets) {
        java.util.List<String> recs = new java.util.ArrayList<>();
        if (!email) recs.add("Add a professional email address in the header section.");
        if (!phone) recs.add("Include a contact phone number for recruiter outreach.");
        if (!linkedin) recs.add("Add your LinkedIn profile URL to improve professional visibility.");
        if (tables) recs.add("Replace tables with simple bullet points for better ATS parsing.");
        if (images) recs.add("Remove images and graphics that ATS systems cannot parse.");
        if (bullets < 8) recs.add("Use more bullet points to highlight achievements and impact.");
        return recs;
    }
}
