package com.resumeintel.application.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.resumeintel.config.AppProperties;
import com.resumeintel.infrastructure.persistence.entity.AnalysisEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfReportService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(30, 58, 95));
    private static final Font HEADING_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 58, 95));
    private static final Font BODY_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z")
            .withZone(ZoneId.systemDefault());

    private final AppProperties appProperties;

    public String generateReport(AnalysisEntity analysis) {
        try {
            Path reportsDir = Paths.get(appProperties.getStorage().getUploadDir(),
                    analysis.getUser().getId().toString(), "reports");
            Files.createDirectories(reportsDir);

            String fileName = "report_" + analysis.getId() + ".pdf";
            Path reportPath = reportsDir.resolve(fileName);

            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, new FileOutputStream(reportPath.toFile()));
            document.open();

            addHeader(document, analysis);
            addExecutiveSummary(document, analysis);
            addMatchScoresTable(document, analysis);
            addMissingSkills(document, analysis);
            addAtsAnalysis(document, analysis);
            addSuggestions(document, analysis);
            addInterviewQuestions(document, analysis);
            addSalaryEstimation(document, analysis);
            addFooter(document, analysis);

            document.close();
            return reportPath.toString();
        } catch (Exception e) {
            log.error("Failed to generate PDF report", e);
            return null;
        }
    }

    private void addHeader(Document document, AnalysisEntity analysis) throws DocumentException {
        Paragraph title = new Paragraph("Resume Intelligence Report", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(5);
        document.add(title);

        Paragraph subtitle = new Paragraph(analysis.getTitle(), HEADING_FONT);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(15);
        document.add(subtitle);

        if (analysis.getOverallMatchScore() != null) {
            Paragraph score = new Paragraph(
                    String.format("Overall Match Score: %.0f%%", analysis.getOverallMatchScore()),
                    new Font(Font.HELVETICA, 16, Font.BOLD, getScoreColor(analysis.getOverallMatchScore())));
            score.setAlignment(Element.ALIGN_CENTER);
            score.setSpacingAfter(20);
            document.add(score);
        }
    }

    private void addExecutiveSummary(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph("Executive Summary", HEADING_FONT));
        String summary = analysis.getExecutiveSummary() != null
                ? analysis.getExecutiveSummary()
                : "No executive summary available.";
        Paragraph p = new Paragraph(summary, BODY_FONT);
        p.setSpacingAfter(15);
        document.add(p);
    }

    private void addMatchScoresTable(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph("Match Score Breakdown", HEADING_FONT));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5);
        table.setSpacingAfter(15);

        addTableHeader(table, "Category");
        addTableHeader(table, "Score (%)");

        Map<String, Object> scores = analysis.getMatchScores();
        if (scores != null) {
            for (Map.Entry<String, Object> entry : scores.entrySet()) {
                addTableCell(table, formatKey(entry.getKey()));
                addTableCell(table, entry.getValue() != null ? entry.getValue().toString() : "N/A");
            }
        }

        document.add(table);
    }

    private void addMissingSkills(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph("Missing Skills", HEADING_FONT));

        Map<String, Object> missingSkills = analysis.getMissingSkills();
        if (missingSkills != null && missingSkills.get("skills") instanceof List<?> skills) {
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(5);
            table.setSpacingAfter(15);

            addTableHeader(table, "Skill");
            addTableHeader(table, "Importance");
            addTableHeader(table, "Priority");
            addTableHeader(table, "Category");

            for (Object skill : skills) {
                if (skill instanceof Map<?, ?> skillMap) {
                    addTableCell(table, String.valueOf(skillMap.get("name")));
                    addTableCell(table, String.valueOf(skillMap.get("importance")));
                    addTableCell(table, String.valueOf(skillMap.get("priority")));
                    addTableCell(table, String.valueOf(skillMap.get("category")));
                }
            }
            document.add(table);
        } else {
            document.add(new Paragraph("No missing skills identified.", BODY_FONT));
        }
    }

    private void addAtsAnalysis(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph("ATS Analysis", HEADING_FONT));

        Map<String, Object> ats = analysis.getAtsAnalysis();
        if (ats != null) {
            Paragraph scoreP = new Paragraph(
                    "ATS Score: " + ats.getOrDefault("atsScore", "N/A") + "%", BODY_FONT);
            scoreP.setSpacingAfter(5);
            document.add(scoreP);

            if (ats.get("recommendations") instanceof List<?> recs) {
                com.lowagie.text.List list = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
                for (Object rec : recs) {
                    list.add(new ListItem(String.valueOf(rec), BODY_FONT));
                }
                document.add(list);
            }
        }
    }

    private void addSuggestions(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph("Improvement Suggestions", HEADING_FONT));

        Map<String, Object> suggestions = analysis.getSuggestions();
        if (suggestions != null) {
            for (Map.Entry<String, Object> entry : suggestions.entrySet()) {
                document.add(new Paragraph(formatKey(entry.getKey()), new Font(Font.HELVETICA, 11, Font.BOLD)));
                if (entry.getValue() instanceof List<?> items) {
                    com.lowagie.text.List list = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
                    for (Object item : items) {
                        list.add(new ListItem(String.valueOf(item), BODY_FONT));
                    }
                    document.add(list);
                }
            }
        }
    }

    private void addInterviewQuestions(Document document, AnalysisEntity analysis) throws DocumentException {
        document.newPage();
        document.add(new Paragraph("Interview Questions", HEADING_FONT));

        Map<String, Object> questions = analysis.getInterviewQuestions();
        if (questions != null) {
            for (Map.Entry<String, Object> entry : questions.entrySet()) {
                document.add(new Paragraph(formatKey(entry.getKey()) + " Questions",
                        new Font(Font.HELVETICA, 11, Font.BOLD)));
                if (entry.getValue() instanceof List<?> items) {
                    com.lowagie.text.List list = new com.lowagie.text.List(com.lowagie.text.List.ORDERED);
                    for (Object item : items) {
                        list.add(new ListItem(String.valueOf(item), BODY_FONT));
                    }
                    document.add(list);
                }
            }
        }
    }

    private void addSalaryEstimation(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph("Salary Estimation", HEADING_FONT));

        Map<String, Object> salary = analysis.getSalaryEstimation();
        if (salary != null) {
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(60);
            table.setSpacingBefore(5);
            table.setSpacingAfter(15);

            addRow(table, "Country", salary.get("country"));
            addRow(table, "Currency", salary.get("currency"));
            addRow(table, "Minimum", salary.get("minSalary"));
            addRow(table, "Median", salary.get("medianSalary"));
            addRow(table, "Maximum", salary.get("maxSalary"));
            addRow(table, "Market Demand", salary.get("marketDemand"));

            document.add(table);
        }
    }

    private void addFooter(Document document, AnalysisEntity analysis) throws DocumentException {
        document.add(new Paragraph(" "));
        Instant timestamp = analysis.getCompletedAt() != null ? analysis.getCompletedAt() : Instant.now();
        Paragraph footer = new Paragraph(
                "Generated by Resume Intelligence Platform on " + FORMATTER.format(timestamp),
                SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
        cell.setBackgroundColor(new Color(30, 58, 95));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", BODY_FONT));
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addRow(PdfPTable table, String label, Object value) {
        addTableCell(table, label);
        addTableCell(table, value != null ? value.toString() : "N/A");
    }

    private Color getScoreColor(double score) {
        if (score >= 80) return new Color(34, 139, 34);
        if (score >= 60) return new Color(255, 165, 0);
        return new Color(220, 53, 69);
    }

    private String formatKey(String key) {
        if (key == null) return "";
        return key.replaceAll("([A-Z])", " $1")
                .replace("_", " ")
                .trim();
        // Capitalize first letter
    }
}
