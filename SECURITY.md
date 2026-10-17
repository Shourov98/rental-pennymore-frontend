# Security Policy

## Supported versions

Security fixes are prioritized for the actively maintained production branch (`main`). Older branches and deployments may not receive updates.

## Reporting a vulnerability

**Do not open a public issue or pull request containing exploit details, credentials, or private user data.**

If private vulnerability reporting is enabled for this repository, use the repository's **Security → Report a vulnerability** option. Otherwise, contact a repository maintainer privately through an established communication channel and request a secure reporting method. Do not send secrets in an unsecured message.

Please include, when safe to share:
- A concise description of the issue and its potential impact.
- Affected paths, versions, and environments.
- Reproduction steps using test data only.
- Any suggested mitigation.

The maintainers will acknowledge and triage reports as capacity permits. Do not test against production systems or real user data without explicit authorization.

## Repository security practices

- Protect `main` with required pull requests, independent review, and required CI checks.
- Use least-privilege GitHub Actions permissions and review third-party Actions.
- Run dependency audits and review Dependabot pull requests before merging.
- Never commit credentials, `.env.local`, tokens, private keys, or production data.
- Keep cloud deployment credentials separate from repository code.
- Review unexpected commits, workflows, and changes to package scripts.
- Use a staging environment and maintain a rollback procedure for production.

## Incident response

If compromise is suspected, preserve logs and commit hashes, restrict affected access, rotate exposed credentials, review automation and dependency changes, and restore from a verified clean release. Coordinate production changes with the system owner.
