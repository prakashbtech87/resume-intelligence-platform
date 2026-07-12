package com.resumeintel.infrastructure.parser;

import com.resumeintel.domain.enums.ResumeFileType;
import com.resumeintel.domain.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Slf4j
@Service
public class ResumeParserService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx", "txt", "rtf");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final Tika tika = new Tika();

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Resume file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds 10MB limit");
        }
        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException("Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, RTF");
        }
    }

    public ResumeFileType detectFileType(String fileName) {
        String ext = getExtension(fileName);
        return switch (ext) {
            case "pdf" -> ResumeFileType.PDF;
            case "doc" -> ResumeFileType.DOC;
            case "docx" -> ResumeFileType.DOCX;
            case "txt" -> ResumeFileType.TXT;
            case "rtf" -> ResumeFileType.RTF;
            default -> ResumeFileType.UNKNOWN;
        };
    }

    public String extractText(MultipartFile file, ResumeFileType fileType) {
        try {
            return switch (fileType) {
                case PDF -> extractFromPdf(file.getInputStream());
                case DOC -> extractFromDoc(file.getInputStream());
                case DOCX -> extractFromDocx(file.getInputStream());
                case TXT -> new String(file.getBytes(), StandardCharsets.UTF_8);
                default -> tika.parseToString(file.getInputStream());
            };
        } catch (IOException e) {
            log.error("Failed to extract text from resume", e);
            throw new BusinessException("Failed to extract text from resume: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to extract text from resume with Tika", e);
            throw new BusinessException("Failed to extract text from resume: " + e.getMessage());
        }
    }

    public String extractTextFromPath(java.nio.file.Path path, ResumeFileType fileType) {
        try (InputStream is = java.nio.file.Files.newInputStream(path)) {
            return switch (fileType) {
                case PDF -> extractFromPdf(is);
                case DOC -> extractFromDoc(is);
                case DOCX -> extractFromDocx(is);
                case TXT -> java.nio.file.Files.readString(path);
                default -> tika.parseToString(is);
            };
        } catch (IOException e) {
            log.error("Failed to extract text from file path", e);
            throw new BusinessException("Failed to extract text: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to extract text from file path with Tika", e);
            throw new BusinessException("Failed to extract text: " + e.getMessage());
        }
    }

    private String extractFromPdf(InputStream inputStream) throws IOException {
        byte[] bytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractFromDoc(InputStream inputStream) throws IOException {
        try (HWPFDocument document = new HWPFDocument(inputStream);
             WordExtractor extractor = new WordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }
}
