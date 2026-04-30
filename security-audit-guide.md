# 🔒 Security Audit Setup & Execution Guide (Ubuntu Native)
## 🎯 Target
- **Stack**: Node.js + Express + Socket.io (Backend) | React + Next.js (Frontend)
- **Environment**: Localhost (ports known to agent)
- **Goal**: Generate PFE/demo-ready HTML/PDF reports, enable local fix loop, prepare for future CI/CD
- **Constraint**: NO Docker. Pure Ubuntu native installation.

---

## 📦 STEP 1: Install Tools (Run Once)
```bash
# 1. Semgrep (SAST - Code patterns)
sudo apt update
sudo apt install -y python3-pip
pip3 install --break-system-packages semgrep

# 2. Trivy (SCA + Secrets - Dependencies & leaked keys)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin

# 3. OWASP ZAP (DAST - Running app HTTP surface)
sudo apt install -y zaproxy

# Navigate to project root
cd /path/to/your/project

# Scan all JS/TS/React/Next/Node files
semgrep scan --config auto --output-format html --output semgrep-report.html .

# Scan dependencies & hardcoded secrets
trivy fs --security-checks vuln,secret --format html --output trivy-report.html .
# Replace <FRONTEND_PORT> with your actual Next.js/React port
zaproxy -cmd -quickurl http://localhost:<FRONTEND_PORT> -quickout zap-report.html

# Fast re-scan (targets only src/, skips node_modules)
semgrep scan --config auto src/ --output-format html --output semgrep-fix.html .

# Re-check dependency updates
trivy fs --security-checks vuln --format html --output trivy-fix.html .

# Restart app → re-run ZAP scan
zaproxy -cmd -quickurl http://localhost:<FRONTEND_PORT> -quickout zap-fix.html



✅ Verification: Run semgrep --version && trivy --version && zaproxy -version. All should return version numbers.
🕵️ STEP 2: Run SAST (Source Code Scan)
bash
12345
🔍 What it catches: dangerouslySetInnerHTML, unsafe eval(), missing input validation, Express middleware flaws, Next.js API route exposures.
✅ Check: ls -l semgrep-report.html → should exist.
🔑 STEP 3: Run SCA + Secret Scanning
bash
12
🔍 What it catches: CVEs in package.json/node_modules, leaked API keys, JWT secrets, .env in git, misconfigured headers in code.
✅ Check: ls -l trivy-report.html → should exist.
🌐 STEP 4: Run DAST (Running App Scan)
⚠️ Prerequisite: Your app MUST be running locally before executing this step.
bash
12
🔍 What it catches: XSS, SQL/NoSQL injection patterns, broken auth headers, CORS misconfig, security headers (CSP, X-Frame-Options), exposed directories.
⏱️ Note: Takes 1-3 minutes. ZAP auto-exits when done.
✅ Check: ls -l zap-report.html → should exist.
📄 STEP 5: Generate PFE-Ready Reports & Screenshots
Open each .html file in Chrome/Edge: google-chrome semgrep-report.html
PDF Export: Ctrl+P → Destination: Save as PDF → Margins: None → Background graphics: Enabled → Save
Screenshots:
Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
Set viewport to 1920x1080
Capture severity tables, finding details, and remediation sections
PFE Caption Template (add below screenshots in your report):
"Automated security audit executed locally using Semgrep (SAST), Trivy (SCA/Secrets), and OWASP ZAP (DAST). Scans target the development build on localhost. Findings are triaged by severity with line-level or endpoint-level remediation guidance. WebSocket protocol testing was performed manually due to automated DAST limitations."