package com.logagent.report;

import com.logagent.model.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Generates HTML reports for log analysis results
 */
public class HTMLReportGenerator {
    
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /**
     * Generate an HTML report for the analysis results
     */
    public String generateReport(AnalysisResult result, String outputDir) throws IOException {
        // Create output directory
        Path outputPath = Paths.get(outputDir);
        if (!Files.exists(outputPath)) {
            Files.createDirectories(outputPath);
        }
        
        // Generate report file
        String reportPath = outputPath.resolve("logagent-report.html").toString();
        
        try (FileWriter writer = new FileWriter(reportPath)) {
            writer.write(generateHTMLContent(result));
        }
        
        return reportPath;
    }

    /**
     * Generate the complete HTML content
     */
    private String generateHTMLContent(AnalysisResult result) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"en\">\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("    <title>LogAgent Analysis Report</title>\n");
        html.append("    <style>\n");
        html.append(generateCSS());
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        
        // Header
        html.append(generateHeader(result));
        
        // Summary Section
        html.append(generateSummarySection(result));
        
        // Issues Breakdown
        html.append(generateIssuesBreakdown(result));
        
        // File Analysis
        html.append(generateFileAnalysisSection(result));
        
        // Detailed Logs
        html.append(generateDetailedLogsSection(result));
        
        // Recommendations
        html.append(generateRecommendationsSection(result));
        
        // Footer
        html.append(generateFooter());
        
        html.append("</body>\n");
        html.append("</html>");
        
        return html.toString();
    }

    /**
     * Generate CSS styles
     */
    private String generateCSS() {
        return """
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   line-height: 1.6; color: #333; background: #f8f9fa; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     color: white; padding: 40px 0; text-align: center; }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .header .subtitle { font-size: 1.2em; opacity: 0.9; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                           gap: 20px; margin: 30px 0; }
            .summary-card { background: white; padding: 20px; border-radius: 10px; 
                           box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .summary-card .number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
            .summary-card .label { color: #666; font-size: 0.9em; }
            .critical { color: #dc3545; }
            .high { color: #fd7e14; }
            .medium { color: #ffc107; }
            .low { color: #28a745; }
            .section { background: white; margin: 30px 0; padding: 30px; border-radius: 10px; 
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .section h2 { color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #ecf0f1; 
                         padding-bottom: 10px; }
            .issues-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                          gap: 15px; }
            .issue-card { padding: 15px; border-radius: 8px; border-left: 4px solid; }
            .issue-card.critical { background: #fdf2f2; border-left-color: #dc3545; }
            .issue-card.high { background: #fff7ed; border-left-color: #fd7e14; }
            .issue-card.medium { background: #fffbeb; border-left-color: #ffc107; }
            .issue-card.low { background: #f0fdf4; border-left-color: #28a745; }
            .issue-count { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; }
            .issue-description { color: #666; font-size: 0.9em; }
            .file-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .file-table th, .file-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ecf0f1; }
            .file-table th { background: #f8f9fa; font-weight: 600; }
            .log-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .log-table th, .log-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ecf0f1; font-size: 0.9em; }
            .log-table th { background: #f8f9fa; font-weight: 600; }
            .log-level { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
            .log-level.debug { background: #e3f2fd; color: #1976d2; }
            .log-level.info { background: #e8f5e8; color: #388e3c; }
            .log-level.warn { background: #fff3e0; color: #f57c00; }
            .log-level.error { background: #ffebee; color: #d32f2f; }
            .log-level.system-out { background: #f3e5f5; color: #7b1fa2; }
            .insight-badge { display: inline-block; padding: 2px 6px; border-radius: 3px; 
                            font-size: 0.7em; margin: 2px; }
            .insight-critical { background: #dc3545; color: white; }
            .insight-high { background: #fd7e14; color: white; }
            .insight-medium { background: #ffc107; color: #333; }
            .insight-low { background: #28a745; color: white; }
            
            /* Filter Controls */
            .filter-controls { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; 
                              padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .filter-group { display: flex; flex-direction: column; gap: 5px; }
            .filter-group label { font-weight: 600; color: #495057; font-size: 0.9em; }
            .filter-group select, .filter-group input { padding: 8px 12px; border: 1px solid #ced4da; 
                                                      border-radius: 4px; font-size: 0.9em; }
            .filter-group select:focus, .filter-group input:focus { outline: none; 
                                                                  border-color: #667eea; box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2); }
            .clear-filters-btn { padding: 8px 16px; background: #6c757d; color: white; 
                                border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; }
            .clear-filters-btn:hover { background: #5a6268; }
            
            /* Results Summary */
            .results-summary { margin: 15px 0; padding: 10px 15px; background: #e3f2fd; 
                              border-radius: 4px; color: #1976d2; font-weight: 500; }
            
            /* Severity Badges */
            .severity-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; 
                             font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
            .severity-critical { background: #dc3545; color: white; }
            .severity-high { background: #fd7e14; color: white; }
            .severity-medium { background: #ffc107; color: #333; }
            .severity-low { background: #28a745; color: white; }
            .severity-none { background: #6c757d; color: white; }
            .recommendation { background: #e3f2fd; padding: 15px; border-radius: 8px; 
                             margin: 10px 0; border-left: 4px solid #2196f3; }
            .footer { text-align: center; padding: 30px; color: #666; border-top: 1px solid #ecf0f1; }
            .quality-score { font-size: 3em; font-weight: bold; margin: 20px 0; }
            .score-excellent { color: #28a745; }
            .score-good { color: #17a2b8; }
            .score-fair { color: #ffc107; }
            .score-poor { color: #dc3545; }
            @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } 
                                       .issues-grid { grid-template-columns: 1fr; } }
            """;
    }

    /**
     * Generate header section
     */
    private String generateHeader(AnalysisResult result) {
        return String.format("""
            <div class="header">
                <div class="container">
                    <h1>🚀 LogAgent Analysis Report</h1>
                    <div class="subtitle">Generated on %s</div>
                </div>
            </div>
            """, DATE_FORMAT.format(new Date()));
    }

    /**
     * Generate summary section
     */
    private String generateSummarySection(AnalysisResult result) {
        LogQualityMetrics metrics = result.getQualityMetrics();
        
        String scoreClass = getScoreClass(metrics.getOverallScore());
        
        return String.format("""
            <div class="container">
                <div class="section">
                    <h2>📊 Analysis Summary</h2>
                    <div class="quality-score %s">%.1f</div>
                    <p style="text-align: center; font-size: 1.2em; color: #666;">Overall Quality Score</p>
                    
                    <div class="summary-grid">
                        <div class="summary-card">
                            <div class="number">%d</div>
                            <div class="label">Total Logs</div>
                        </div>
                        <div class="summary-card">
                            <div class="number">%d</div>
                            <div class="label">Files Analyzed</div>
                        </div>
                        <div class="summary-card">
                            <div class="number">%d</div>
                            <div class="label">Critical Issues</div>
                        </div>
                        <div class="summary-card">
                            <div class="number">%d</div>
                            <div class="label">High Issues</div>
                        </div>
                    </div>
                </div>
            </div>
            """, scoreClass, metrics.getOverallScore(), 
                 metrics.getTotalLogs(), result.getFilesAnalyzed(),
                 metrics.getCriticalIssues(), metrics.getHighIssues());
    }

    /**
     * Generate issues breakdown section
     */
    private String generateIssuesBreakdown(AnalysisResult result) {
        LogQualityMetrics metrics = result.getQualityMetrics();
        
        return String.format("""
            <div class="container">
                <div class="section">
                    <h2>🎯 Issues Breakdown</h2>
                    <div class="issues-grid">
                        <div class="issue-card critical">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Critical Issues</div>
                        </div>
                        <div class="issue-card high">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">High Priority Issues</div>
                        </div>
                        <div class="issue-card medium">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Medium Priority Issues</div>
                        </div>
                        <div class="issue-card low">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Low Priority Issues</div>
                        </div>
                    </div>
                    
                    <div class="issues-grid" style="margin-top: 20px;">
                        <div class="issue-card medium">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Redundant Logs</div>
                        </div>
                        <div class="issue-card high">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Incorrect Log Levels</div>
                        </div>
                        <div class="issue-card high">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">High Frequency Logs</div>
                        </div>
                        <div class="issue-card high">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Missing Error Logs</div>
                        </div>
                        <div class="issue-card medium">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Unstructured Logs</div>
                        </div>
                        <div class="issue-card critical">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">Sensitive Data Logs</div>
                        </div>
                        <div class="issue-card medium">
                            <div class="issue-count">%d</div>
                            <div class="issue-description">High Cost Logs</div>
                        </div>
                    </div>
                </div>
            </div>
            """, metrics.getCriticalIssues(), metrics.getHighIssues(), 
                 metrics.getMediumIssues(), metrics.getLowIssues(),
                 metrics.getRedundantLogs(), metrics.getIncorrectLevelLogs(),
                 metrics.getHighFrequencyLogs(), metrics.getMissingLogs(),
                 metrics.getUnstructuredLogs(), metrics.getSensitiveDataLogs(),
                 metrics.getHighCostLogs());
    }

    /**
     * Generate file analysis section
     */
    private String generateFileAnalysisSection(AnalysisResult result) {
        LogQualityMetrics metrics = result.getQualityMetrics();
        Map<String, Double> fileScores = metrics.getFileScores();
        
        if (fileScores == null || fileScores.isEmpty()) {
            return """
                <div class="container">
                    <div class="section">
                        <h2>📁 File Analysis</h2>
                        <p>No file-specific metrics available.</p>
                    </div>
                </div>
                """;
        }
        
        StringBuilder tableRows = new StringBuilder();
        fileScores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .forEach(entry -> {
                String scoreClass = getScoreClass(entry.getValue());
                tableRows.append(String.format("""
                    <tr>
                        <td>%s</td>
                        <td><span class="quality-score %s">%.1f</span></td>
                    </tr>
                    """, entry.getKey(), scoreClass, entry.getValue()));
            });
        
        return String.format("""
            <div class="container">
                <div class="section">
                    <h2>📁 File Analysis</h2>
                    <p><strong>Best Quality File:</strong> %s</p>
                    <p><strong>Needs Attention:</strong> %s</p>
                    
                    <table class="file-table">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Quality Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            %s
                        </tbody>
                    </table>
                </div>
            </div>
            """, result.getBestQualityFile(), result.getNeedsAttentionFile(), tableRows.toString());
    }

    /**
     * Generate detailed logs section with filterable table
     */
    private String generateDetailedLogsSection(AnalysisResult result) {
        List<LogStatement> logs = result.getLogs();
        
        if (logs == null || logs.isEmpty()) {
            return """
                <div class="container">
                    <div class="section">
                        <h2>📝 Detailed Log Analysis</h2>
                        <p>No log statements found.</p>
                    </div>
                </div>
                """;
        }
        
        // Generate filterable table with all logs
        StringBuilder tableRows = new StringBuilder();
        logs.forEach(log -> {
            String levelClass = "log-level " + log.getLevel().toString().toLowerCase();
            String insightsHtml = generateInsightsHtml(log.getInsights());
            String issueTypes = extractIssueTypes(log.getInsights());
            String severity = extractHighestSeverity(log.getInsights());
            
            tableRows.append(String.format("""
                <tr data-issue-type="%s" data-severity="%s">
                    <td>%s</td>
                    <td>%s</td>
                    <td><span class="%s">%s</span></td>
                    <td>%d</td>
                    <td>%s</td>
                    <td><span class="severity-badge %s">%s</span></td>
                </tr>
                """, issueTypes, severity.toLowerCase(),
                     log.getFileName(), log.getShortFilePath(),
                     levelClass, log.getLevel().toString().toUpperCase(),
                     log.getLineNumber(),
                     issueTypes.isEmpty() ? "No Issues" : issueTypes,
                     "severity-" + severity.toLowerCase(), severity));
        });
        
        return String.format("""
            <div class="container">
                <div class="section">
                    <h2>📝 Detailed Log Analysis</h2>
                    <p>Total logs analyzed: %d. Use filters below to focus on specific issues.</p>
                    
                    <!-- Filter Controls -->
                    <div class="filter-controls">
                        <div class="filter-group">
                            <label for="issueTypeFilter">Filter by Issue Type:</label>
                            <select id="issueTypeFilter" onchange="filterTable()">
                                <option value="">All Issue Types</option>
                                <option value="redundancy">Redundancy</option>
                                <option value="incorrect_level">Incorrect Level</option>
                                <option value="high_frequency">High Frequency</option>
                                <option value="missing_log">Missing Log</option>
                                <option value="unstructured">Unstructured</option>
                                <option value="sensitive_data">Sensitive Data</option>
                                <option value="high_cost">High Cost</option>
                                <option value="exception_handling">Exception Handling</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="severityFilter">Filter by Severity:</label>
                            <select id="severityFilter" onchange="filterTable()">
                                <option value="">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="searchFilter">Search:</label>
                            <input type="text" id="searchFilter" placeholder="Search logs..." onkeyup="filterTable()">
                        </div>
                        
                        <div class="filter-group">
                            <button onclick="clearFilters()" class="clear-filters-btn">Clear Filters</button>
                        </div>
                    </div>
                    
                    <!-- Results Summary -->
                    <div class="results-summary">
                        <span id="visibleCount">%d</span> of %d logs visible
                    </div>
                    
                    <table class="log-table" id="logsTable">
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th>Location</th>
                                <th>Log Level</th>
                                <th>Line Number</th>
                                <th>Issue Type</th>
                                <th>Severity</th>
                            </tr>
                        </thead>
                        <tbody>
                            %s
                        </tbody>
                    </table>
                    
                    <!-- JavaScript for filtering -->
                    <script>
                        function filterTable() {
                            const issueTypeFilter = document.getElementById('issueTypeFilter').value.toLowerCase();
                            const severityFilter = document.getElementById('severityFilter').value.toLowerCase();
                            const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
                            
                            const table = document.getElementById('logsTable');
                            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
                            let visibleCount = 0;
                            
                            for (let i = 0; i < rows.length; i++) {
                                const row = rows[i];
                                const issueType = row.getAttribute('data-issue-type').toLowerCase();
                                const severity = row.getAttribute('data-severity').toLowerCase();
                                const text = row.textContent.toLowerCase();
                                
                                const matchesIssueType = !issueTypeFilter || issueType.includes(issueTypeFilter);
                                const matchesSeverity = !severityFilter || severity === severityFilter;
                                const matchesSearch = !searchFilter || text.includes(searchFilter);
                                
                                if (matchesIssueType && matchesSeverity && matchesSearch) {
                                    row.style.display = '';
                                    visibleCount++;
                                } else {
                                    row.style.display = 'none';
                                }
                            }
                            
                            document.getElementById('visibleCount').textContent = visibleCount;
                        }
                        
                        function clearFilters() {
                            document.getElementById('issueTypeFilter').value = '';
                            document.getElementById('severityFilter').value = '';
                            document.getElementById('searchFilter').value = '';
                            filterTable();
                        }
                    </script>
                </div>
            </div>
            """, logs.size(), logs.size(), tableRows.toString());
    }

    /**
     * Generate recommendations section
     */
    private String generateRecommendationsSection(AnalysisResult result) {
        List<String> recommendations = result.getRecommendations();
        
        if (recommendations == null || recommendations.isEmpty()) {
            return """
                <div class="container">
                    <div class="section">
                        <h2>💡 Recommendations</h2>
                        <p>No specific recommendations available.</p>
                    </div>
                </div>
                """;
        }
        
        StringBuilder recommendationsHtml = new StringBuilder();
        for (String recommendation : recommendations) {
            recommendationsHtml.append(String.format("""
                <div class="recommendation">%s</div>
                """, recommendation));
        }
        
        return String.format("""
            <div class="container">
                <div class="section">
                    <h2>💡 Recommendations</h2>
                    %s
                </div>
            </div>
            """, recommendationsHtml.toString());
    }

    /**
     * Generate footer
     */
    private String generateFooter() {
        return """
            <div class="footer">
                <div class="container">
                    <p>Generated by LogAgent CLI - Intelligent Log Analysis Tool</p>
                    <p>For more information, visit the LogAgent documentation</p>
                </div>
            </div>
            """;
    }

    /**
     * Generate insights HTML
     */
    private String generateInsightsHtml(List<LogInsight> insights) {
        if (insights == null || insights.isEmpty()) {
            return "<span style='color: #28a745;'>✓ No issues</span>";
        }
        
        StringBuilder html = new StringBuilder();
        for (LogInsight insight : insights) {
            String severityClass = "insight-" + insight.getSeverity().toString().toLowerCase();
            html.append(String.format("<span class='insight-badge %s'>%s</span>", 
                                   severityClass, insight.getType().toString().toUpperCase()));
        }
        return html.toString();
    }

    /**
     * Get CSS class for quality score
     */
    private String getScoreClass(double score) {
        if (score >= 90) return "score-excellent";
        if (score >= 75) return "score-good";
        if (score >= 60) return "score-fair";
        return "score-poor";
    }

    /**
     * Truncate message for display
     */
    private String truncateMessage(String message, int maxLength) {
        if (message.length() <= maxLength) return message;
        return message.substring(0, maxLength - 3) + "...";
    }
    
    /**
     * Extract issue types from insights
     */
    private String extractIssueTypes(List<LogInsight> insights) {
        if (insights == null || insights.isEmpty()) {
            return "";
        }
        
        return insights.stream()
            .map(insight -> insight.getType().toString().toLowerCase().replace('_', ' '))
            .distinct()
            .collect(java.util.stream.Collectors.joining(", "));
    }
    
    /**
     * Extract highest severity from insights
     */
    private String extractHighestSeverity(List<LogInsight> insights) {
        if (insights == null || insights.isEmpty()) {
            return "NONE";
        }
        
        // Define severity hierarchy
        java.util.Map<String, Integer> severityOrder = java.util.Map.of(
            "CRITICAL", 4,
            "HIGH", 3,
            "MEDIUM", 2,
            "LOW", 1
        );
        
        return insights.stream()
            .map(insight -> insight.getSeverity().toString())
            .max((a, b) -> Integer.compare(
                severityOrder.getOrDefault(a, 0),
                severityOrder.getOrDefault(b, 0)
            ))
            .orElse("NONE");
    }
}
