/**
 * Generates a Markdown report compliant with HackerOne & Bugcrowd standards.
 * @param {Object} finding - Object temuan bug beserta data program terkait.
 * @returns {string} Markdown text string
 */
export function generateMarkdownReport(finding) {
  const dateStr = new Date(finding.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `# [${finding.severity}] ${finding.title}

**Program:** ${finding.program?.name || 'N/A'}
**Target/Asset:** ${finding.program?.assets?.[0]?.identifier || 'N/A'}
**Severity:** ${finding.severity}
**Date Reported:** ${dateStr}
**Status:** ${finding.status}

---

## 1. Summary
${finding.summary || 'No summary provided.'}

---

## 2. Steps to Reproduce
${finding.stepsToRepo || '1. N/A'}

---

## 3. Impact
${finding.impact || 'No impact detailed.'}

---

## 4. Remediation / Suggested Fix
${finding.suggestedFix || 'Apply standard security best practices for this vulnerability class.'}

---
*Report generated automatically via BountyOps Workflow Tool.*
`;
}
