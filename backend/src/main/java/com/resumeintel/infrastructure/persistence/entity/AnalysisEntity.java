package com.resumeintel.infrastructure.persistence.entity;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public class AnalysisEntity {
    private UUID id = UUID.randomUUID();
    private User user = new User();
    private String title = "Software Engineer";
    private Double overallMatchScore = 85.0;
    private String executiveSummary = "Excellent match for the role.";
    private Map<String, Object> matchScores = Map.of("technical", 90, "experience", 80);
    private Map<String, Object> missingSkills = Map.of("skills", java.util.List.of());
    private Map<String, Object> atsAnalysis = Map.of("atsScore", 85);
    private Map<String, Object> suggestions = Map.of("experience", java.util.List.of("Highlight leadership experience."));
    private Map<String, Object> interviewQuestions = Map.of("technical", java.util.List.of("Explain polymorphism."));
    private Map<String, Object> salaryEstimation = Map.of(
            "country", "US",
            "currency", "USD",
            "minSalary", 100000,
            "medianSalary", 120000,
            "maxSalary", 140000,
            "marketDemand", "High"
    );
    private Instant completedAt = Instant.now();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getOverallMatchScore() {
        return overallMatchScore;
    }

    public void setOverallMatchScore(Double overallMatchScore) {
        this.overallMatchScore = overallMatchScore;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public Map<String, Object> getMatchScores() {
        return matchScores;
    }

    public void setMatchScores(Map<String, Object> matchScores) {
        this.matchScores = matchScores;
    }

    public Map<String, Object> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(Map<String, Object> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public Map<String, Object> getAtsAnalysis() {
        return atsAnalysis;
    }

    public void setAtsAnalysis(Map<String, Object> atsAnalysis) {
        this.atsAnalysis = atsAnalysis;
    }

    public Map<String, Object> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(Map<String, Object> suggestions) {
        this.suggestions = suggestions;
    }

    public Map<String, Object> getInterviewQuestions() {
        return interviewQuestions;
    }

    public void setInterviewQuestions(Map<String, Object> interviewQuestions) {
        this.interviewQuestions = interviewQuestions;
    }

    public Map<String, Object> getSalaryEstimation() {
        return salaryEstimation;
    }

    public void setSalaryEstimation(Map<String, Object> salaryEstimation) {
        this.salaryEstimation = salaryEstimation;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
