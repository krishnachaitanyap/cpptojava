package com.logagent;

import com.logagent.analyzer.LogAnalyzer;
import com.logagent.analyzer.LogInsightAnalyzer;
import com.logagent.parser.JavaLogParser;
import com.logagent.model.*;
import com.logagent.report.HTMLReportGenerator;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Scanner;

/**
 * Command Line Interface for LogAgent
 * Analyzes Java repositories and generates HTML reports
 */
public class LogAgentCLI {
    
    private static final String VERSION = "1.0.0";
    private static final String USAGE = """
        LogAgent CLI - Java Log Analysis Tool
        Version: %s
        
        Usage: java -cp . com.logagent.LogAgentCLI [options]
        
        Options:
        -r, --repo <path>     Path to Java repository to analyze
        -o, --output <path>   Output directory for HTML report (default: ./logagent-report)
        -h, --help           Show this help message
        -v, --version        Show version information
        
        Examples:
        java -cp . com.logagent.LogAgentCLI -r /path/to/java/project
        java -cp . com.logagent.LogAgentCLI -r /path/to/java/project -o /path/to/output
        """.formatted(VERSION);

    public static void main(String[] args) {
        LogAgentCLI cli = new LogAgentCLI();
        cli.run(args);
    }

    public void run(String[] args) {
        try {
            // Parse command line arguments
            CommandLineArgs cmdArgs = parseArguments(args);
            
            if (cmdArgs.showHelp) {
                System.out.println(USAGE);
                return;
            }
            
            if (cmdArgs.showVersion) {
                System.out.println("LogAgent CLI Version: " + VERSION);
                return;
            }
            
            if (cmdArgs.repoPath == null) {
                System.err.println("Error: Repository path is required");
                System.out.println(USAGE);
                System.exit(1);
            }
            
            // Validate repository path
            if (!Files.exists(Paths.get(cmdArgs.repoPath))) {
                System.err.println("Error: Repository path does not exist: " + cmdArgs.repoPath);
                System.exit(1);
            }
            
            // Run analysis
            runAnalysis(cmdArgs.repoPath, cmdArgs.outputPath);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private void runAnalysis(String repoPath, String outputPath) {
        System.out.println("🚀 LogAgent CLI Starting Analysis...");
        System.out.println("📁 Repository: " + repoPath);
        System.out.println("📊 Output: " + outputPath);
        System.out.println();
        
        try {
            // Initialize components
            JavaLogParser parser = new JavaLogParser();
            LogInsightAnalyzer insightAnalyzer = new LogInsightAnalyzer();
            LogAnalyzer analyzer = new LogAnalyzer(parser, insightAnalyzer);
            
            System.out.println("🔍 Scanning Java files...");
            
            // Analyze repository
            AnalysisResult result = analyzer.analyzeRepository(repoPath);
            
            System.out.println("✅ Analysis complete!");
            System.out.println("📈 Found " + result.getLogs().size() + " log statements");
            System.out.println("📊 Overall quality score: " + String.format("%.1f", result.getQualityMetrics().getOverallScore()));
            System.out.println();
            
            // Generate HTML report
            System.out.println("📝 Generating HTML report...");
            HTMLReportGenerator reportGenerator = new HTMLReportGenerator();
            String reportPath = reportGenerator.generateReport(result, outputPath);
            
            System.out.println("🎉 Report generated successfully!");
            System.out.println("📄 Report location: " + reportPath);
            System.out.println();
            
            // Display summary
            displaySummary(result);
            
            // Open report in browser if possible
            openReportInBrowser(reportPath);
            
        } catch (Exception e) {
            System.err.println("❌ Analysis failed: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private void displaySummary(AnalysisResult result) {
        LogQualityMetrics metrics = result.getQualityMetrics();
        
        System.out.println("📋 Analysis Summary:");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.printf("📊 Total Logs: %d%n", metrics.getTotalLogs());
        System.out.printf("🔴 Critical Issues: %d%n", metrics.getCriticalIssues());
        System.out.printf("🟠 High Issues: %d%n", metrics.getHighIssues());
        System.out.printf("🟡 Medium Issues: %d%n", metrics.getMediumIssues());
        System.out.printf("🟢 Low Issues: %d%n", metrics.getLowIssues());
        System.out.println();
        
        System.out.println("🎯 Issue Breakdown:");
        System.out.printf("   • Redundant Logs: %d%n", metrics.getRedundantLogs());
        System.out.printf("   • Incorrect Log Levels: %d%n", metrics.getIncorrectLevelLogs());
        System.out.printf("   • High Frequency Logs: %d%n", metrics.getHighFrequencyLogs());
        System.out.printf("   • Missing Logs: %d%n", metrics.getMissingLogs());
        System.out.printf("   • Unstructured Logs: %d%n", metrics.getUnstructuredLogs());
        System.out.printf("   • Sensitive Data Logs: %d%n", metrics.getSensitiveDataLogs());
        System.out.printf("   • High Cost Logs: %d%n", metrics.getHighCostLogs());
        System.out.println();
        
        System.out.println("📁 Files Analyzed: " + result.getFilesAnalyzed());
        System.out.println("🏆 Best Quality File: " + result.getBestQualityFile());
        System.out.println("⚠️  Needs Attention: " + result.getNeedsAttentionFile());
        System.out.println();
        
        System.out.println("💡 Recommendations:");
        List<String> recommendations = result.getRecommendations();
        for (int i = 0; i < Math.min(recommendations.size(), 5); i++) {
            System.out.println("   " + (i + 1) + ". " + recommendations.get(i));
        }
        if (recommendations.size() > 5) {
            System.out.println("   ... and " + (recommendations.size() - 5) + " more recommendations");
        }
    }

    private void openReportInBrowser(String reportPath) {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            String command;
            
            if (os.contains("win")) {
                command = "cmd /c start " + reportPath;
            } else if (os.contains("mac")) {
                command = "open " + reportPath;
            } else {
                command = "xdg-open " + reportPath;
            }
            
            Process process = Runtime.getRuntime().exec(command);
            System.out.println("🌐 Opening report in default browser...");
            
        } catch (Exception e) {
            System.out.println("💡 Tip: Open the HTML report manually in your browser: " + reportPath);
        }
    }

    private CommandLineArgs parseArguments(String[] args) {
        CommandLineArgs cmdArgs = new CommandLineArgs();
        
        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            
            switch (arg) {
                case "-r", "--repo":
                    if (i + 1 < args.length) {
                        cmdArgs.repoPath = args[++i];
                    }
                    break;
                case "-o", "--output":
                    if (i + 1 < args.length) {
                        cmdArgs.outputPath = args[++i];
                    }
                    break;
                case "-h", "--help":
                    cmdArgs.showHelp = true;
                    break;
                case "-v", "--version":
                    cmdArgs.showVersion = true;
                    break;
                default:
                    if (cmdArgs.repoPath == null) {
                        cmdArgs.repoPath = arg;
                    }
                    break;
            }
        }
        
        // Set default output path if not specified
        if (cmdArgs.outputPath == null) {
            cmdArgs.outputPath = "./logagent-report";
        }
        
        return cmdArgs;
    }

    private static class CommandLineArgs {
        String repoPath;
        String outputPath;
        boolean showHelp;
        boolean showVersion;
    }
}
