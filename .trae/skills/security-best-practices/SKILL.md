---
name: security-best-practices
description: Perform language and framework specific security best-practice reviews and suggest improvements. Invoke when user explicitly requests a security review, security best practices guidance, or secure-by-default coding help.
---

# Security Best Practices

## Overview

This skill provides guidance on identifying languages and frameworks in the current context, then applying security best practices for those languages and frameworks.

## Workflow

1. Identify ALL languages and ALL frameworks in scope - both frontend and backend.
2. Consider well-known security best practices for the identified languages and frameworks.
3. Operate in three modes:
   - **Primary mode**: Use security knowledge to write secure-by-default code from this point forward.
   - **Secondary mode**: Passively detect vulnerabilities while working, flagging critical or high-impact issues.
   - **User-requested mode**: Produce a full security report with prioritized findings and offer to fix them.

### Security Review References by Language

**Python:**
- Avoid using `eval()`, `exec()`, `pickle.loads()` on untrusted input
- Use parameterized queries with SQL databases (SQLAlchemy, Django ORM)
- Validate and sanitize all user input; use Pydantic/marshmallow for schema validation
- For Django: enable CSRF protection, set SECRET_KEY properly, use `@login_required`, avoid raw SQL
- For Flask: disable debug mode in production, use Flask-Login, set secure session cookies
- For FastAPI: use Pydantic models for input validation, set proper CORS origins

**JavaScript/TypeScript:**
- Use `helmet` middleware for Express to set security headers
- Sanitize user input to prevent XSS; use `DOMPurify` for client-side
- Use parameterized queries or ORMs (Prisma, TypeORM) to prevent SQL injection
- Set `httpOnly`, `secure`, `sameSite` flags on cookies
- Use CSP headers to prevent XSS and data injection
- For React: avoid `dangerouslySetInnerHTML` with untrusted content
- For Next.js: use server-side data fetching for sensitive data, avoid exposing API keys

**Golang:**
- Use `html/template` (not `text/template`) for HTML output to auto-escape
- Validate all user input; use struct tags for validation
- Use parameterized queries; never concatenate SQL strings
- Set proper CORS headers; use `net/http` timeout settings
- Avoid `panic()` in production handlers; use proper error handling

### General Security Advice

#### Avoid Using Incrementing IDs for Public IDs of Resources

When assigning IDs for resources exposed to the internet, use longer random UUID4 or random hex strings instead of small auto-incrementing IDs.

#### TLS Considerations

While TLS is important for production, most development work runs without it. Be careful about reporting lack of TLS as a security issue. Be cautious with "secure" cookies - they should only be set when the application will actually be over TLS.

#### Secrets Management

- Never commit secrets to version control
- Use environment variables or a secrets manager
- Never log credentials, tokens, or keys

## Report Format

When producing a security report, write it as a markdown file. The report should have:

1. A short executive summary at the top
2. Clearly delineated sections based on severity (Critical, High, Medium, Low)
3. Each finding with a numeric ID for reference
4. Line number references for affected code
5. For critical findings, include a one-sentence impact statement

## Fixes

When producing fixes:
- Fix one finding at a time
- Add concise comments explaining the security rationale
- Consider if changes will impact existing functionality
- Follow existing change/commit flow and testing protocols
- Provide clear commit messages explaining alignment with security best practices
