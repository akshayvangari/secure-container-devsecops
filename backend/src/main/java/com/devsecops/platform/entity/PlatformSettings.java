package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "platform_settings")
public class PlatformSettings {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "platform_name", length = 150)
    private String platformName = "DevSecOps Enterprise Security";

    @Column(name = "default_branch", length = 100)
    private String defaultBranch = "main";

    @Column(name = "auto_generate_k8s")
    private Boolean autoGenerateK8s = true;

    @Column(name = "block_deployment_on_critical")
    private Boolean blockDeploymentOnCritical = true;

    @Column(name = "block_deployment_on_secrets")
    private Boolean blockDeploymentOnSecrets = true;

    @Column(name = "require_image_signing")
    private Boolean requireImageSigning = true;

    @Column(name = "require_non_root")
    private Boolean requireNonRoot = true;

    @Column(name = "require_dependency_scan")
    private Boolean requireDependencyScan = true;

    @Column(name = "require_image_scan")
    private Boolean requireImageScan = true;

    @Column(name = "notification_critical_findings")
    private Boolean notificationCriticalFindings = true;

    @Column(name = "notification_failed_pipelines")
    private Boolean notificationFailedPipelines = true;

    @Column(name = "notification_runtime_alerts")
    private Boolean notificationRuntimeAlerts = true;

    @Column(name = "notification_compliance_warnings")
    private Boolean notificationComplianceWarnings = true;

    @Column(name = "slack_webhook_url", length = 500)
    private String slackWebhookUrl;

    @Column(name = "teams_webhook_url", length = 500)
    private String teamsWebhookUrl;

    @Column(name = "email_recipients", length = 500)
    private String emailRecipients;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public PlatformSettings() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPlatformName() { return platformName; }
    public void setPlatformName(String platformName) { this.platformName = platformName; }
    public String getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(String defaultBranch) { this.defaultBranch = defaultBranch; }
    public Boolean getAutoGenerateK8s() { return autoGenerateK8s; }
    public void setAutoGenerateK8s(Boolean autoGenerateK8s) { this.autoGenerateK8s = autoGenerateK8s; }
    public Boolean getBlockDeploymentOnCritical() { return blockDeploymentOnCritical; }
    public void setBlockDeploymentOnCritical(Boolean blockDeploymentOnCritical) { this.blockDeploymentOnCritical = blockDeploymentOnCritical; }
    public Boolean getBlockDeploymentOnSecrets() { return blockDeploymentOnSecrets; }
    public void setBlockDeploymentOnSecrets(Boolean blockDeploymentOnSecrets) { this.blockDeploymentOnSecrets = blockDeploymentOnSecrets; }
    public Boolean getRequireImageSigning() { return requireImageSigning; }
    public void setRequireImageSigning(Boolean requireImageSigning) { this.requireImageSigning = requireImageSigning; }
    public Boolean getRequireNonRoot() { return requireNonRoot; }
    public void setRequireNonRoot(Boolean requireNonRoot) { this.requireNonRoot = requireNonRoot; }
    public Boolean getRequireDependencyScan() { return requireDependencyScan; }
    public void setRequireDependencyScan(Boolean requireDependencyScan) { this.requireDependencyScan = requireDependencyScan; }
    public Boolean getRequireImageScan() { return requireImageScan; }
    public void setRequireImageScan(Boolean requireImageScan) { this.requireImageScan = requireImageScan; }
    public Boolean getNotificationCriticalFindings() { return notificationCriticalFindings; }
    public void setNotificationCriticalFindings(Boolean notificationCriticalFindings) { this.notificationCriticalFindings = notificationCriticalFindings; }
    public Boolean getNotificationFailedPipelines() { return notificationFailedPipelines; }
    public void setNotificationFailedPipelines(Boolean notificationFailedPipelines) { this.notificationFailedPipelines = notificationFailedPipelines; }
    public Boolean getNotificationRuntimeAlerts() { return notificationRuntimeAlerts; }
    public void setNotificationRuntimeAlerts(Boolean notificationRuntimeAlerts) { this.notificationRuntimeAlerts = notificationRuntimeAlerts; }
    public Boolean getNotificationComplianceWarnings() { return notificationComplianceWarnings; }
    public void setNotificationComplianceWarnings(Boolean notificationComplianceWarnings) { this.notificationComplianceWarnings = notificationComplianceWarnings; }
    public String getSlackWebhookUrl() { return slackWebhookUrl; }
    public void setSlackWebhookUrl(String slackWebhookUrl) { this.slackWebhookUrl = slackWebhookUrl; }
    public String getTeamsWebhookUrl() { return teamsWebhookUrl; }
    public void setTeamsWebhookUrl(String teamsWebhookUrl) { this.teamsWebhookUrl = teamsWebhookUrl; }
    public String getEmailRecipients() { return emailRecipients; }
    public void setEmailRecipients(String emailRecipients) { this.emailRecipients = emailRecipients; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
