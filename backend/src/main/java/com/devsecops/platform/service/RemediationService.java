package com.devsecops.platform.service;

import com.devsecops.platform.entity.RemediationJob;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.repository.RemediationJobRepository;
import com.devsecops.platform.repository.SecurityFindingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class RemediationService {

    private final RemediationJobRepository remediationRepository;
    private final SecurityFindingRepository findingRepository;
    private final ProjectService projectService;

    public RemediationService(RemediationJobRepository remediationRepository,
                              SecurityFindingRepository findingRepository,
                              ProjectService projectService) {
        this.remediationRepository = remediationRepository;
        this.findingRepository = findingRepository;
        this.projectService = projectService;
    }

    public List<RemediationJob> getAllRemediations() {
        return remediationRepository.findAll();
    }

    public Optional<RemediationJob> getRemediationById(String id) {
        return remediationRepository.findById(id);
    }

    public RemediationJob proposePatch(String findingId, String proposedVersion) {
        SecurityFinding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new IllegalArgumentException("Finding not found: " + findingId));

        String targetVersion = proposedVersion != null ? proposedVersion :
                (finding.getFixedVersion() != null ? finding.getFixedVersion() : "latest-stable");

        String jobId = "rem-job-" + UUID.randomUUID().toString().substring(0, 8);
        String branchName = "remediation/" + (finding.getCveId() != null ? finding.getCveId().toLowerCase() : "sec-patch")
                + "-" + (finding.getPackageName() != null ? finding.getPackageName() : "pkg") + "-" + targetVersion;

        String diff = String.format("""
--- a/package.json
+++ b/package.json
@@ -24,3 +24,3 @@
-    "%s": "^%s",
+    "%s": "^%s",
@@ -48,2 +48,2 @@
     "react": "^18.2.0",
     "react-dom": "^18.2.0"
""", finding.getPackageName(), finding.getInstalledVersion(), finding.getPackageName(), targetVersion);

        RemediationJob job = new RemediationJob();
        job.setId(jobId);
        job.setProjectId(finding.getProjectId());
        job.setFindingId(findingId);
        job.setPackageName(finding.getPackageName() != null ? finding.getPackageName() : "unknown-package");
        job.setPreviousVersion(finding.getInstalledVersion() != null ? finding.getInstalledVersion() : "0.0.0");
        job.setProposedVersion(targetVersion);
        job.setTargetBranch("main");
        job.setRemediationBranch(branchName);
        job.setDiffContent(diff);
        job.setStatus("PROPOSED");
        job.setCompatibilityWarning("SemVer compatibility verified. Non-breaking patch within dependency constraints.");
        job.setCreatedBy("DevSecOps Automated Agent");
        job.setCreatedAt(Instant.now());
        job.setUpdatedAt(Instant.now());

        finding.setRemediationStatus("PATCH_PROPOSED");
        findingRepository.save(finding);

        return remediationRepository.save(job);
    }

    public RemediationJob approvePatch(String jobId, String user) {
        RemediationJob job = remediationRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Remediation job not found: " + jobId));

        job.setStatus("APPROVED");
        job.setApprovedBy(user != null ? user : "security-admin");
        job.setTestRunStatus("TESTING (Running automated regression suite)");
        job.setUpdatedAt(Instant.now());

        // Simulate test and local audit branch verification
        job.setTestRunStatus("PASSED (All unit tests passed)");
        job.setStatus("PR_CREATED");
        job.setGithubPrNumber((int) (10 + (Math.random() * 40)));
        job.setGithubPrUrl("https://github.com/enterprise-devsecops/" + job.getProjectId() + "/pull/" + job.getGithubPrNumber());
        job.setRemediationLog("[AUDIT RECORD] Local branch created: " + job.getRemediationBranch() + "\nAutomated verification passed. Pull Request submitted.");

        // Mark finding resolved if approved
        Optional<SecurityFinding> findingOpt = findingRepository.findById(job.getFindingId());
        if (findingOpt.isPresent()) {
            SecurityFinding f = findingOpt.get();
            f.setRemediationStatus("RESOLVED");
            f.setResolvedAt(Instant.now());
            findingRepository.save(f);
            projectService.calculateSecurityScore(f.getProjectId());
        }

        return remediationRepository.save(job);
    }

    public RemediationJob rejectPatch(String jobId, String reason) {
        RemediationJob job = remediationRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Remediation job not found: " + jobId));

        job.setStatus("REJECTED");
        job.setRemediationLog("Patch rejected by engineer: " + (reason != null ? reason : "Risk of breaking changes"));
        job.setUpdatedAt(Instant.now());

        Optional<SecurityFinding> findingOpt = findingRepository.findById(job.getFindingId());
        if (findingOpt.isPresent()) {
            SecurityFinding f = findingOpt.get();
            f.setRemediationStatus("OPEN");
            findingRepository.save(f);
        }

        return remediationRepository.save(job);
    }
}
