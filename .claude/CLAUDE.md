# Project Documentation

## Metadata
- **Project Name**: C-ode to you (C Language Learning App)
- **Version**: 0.1.0
- **Last Updated**: 2025-12-03
- **Target Platform**: Android (Mobile)
- **Primary Language**: C Language (Initial Version)
- **Documentation Language**: English
- **Status**: In Development
- **Code Principles**: Follow SOLID and DRY principles in all design and implementation when possible.

---

## Table of Contents
1. [Project Purpose](#1-project-purpose)
2. [App Overview](#2-app-overview)
3. [AI Model Rules (Critical)](#3-ai-model-rules-critical)
4. [Technology Stack](#4-technology-stack)
5. [Key Features](#5-key-features)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Related Documentation](#7-related-documentation)

---

## 1) Project Purpose

This document provides guidance on roles, response rules, code style, API/DB specifications, and feature directions for AI assisting in the development of this project.

The app supports learning C language through problem-solving on mobile (Android) environments, with problem sources referenced from Baekjoon Online Judge.

---

## 2) App Overview

- **Learning Language**: C Language (initial version)
- **Learning Method**: Practice through problems + C standard function/library syntax learning + AI hints
- **Target Users**: C language beginners, algorithm beginners
- **Key Differentiators**:
  - Korean-based AI hints
  - Focus on explaining C language function usage
  - Automatic GitHub contribution tracking feature
  - Semi-automatic coding support (auto-review / hints / function recommendations)

---

## 3) AI Model Rules (Critical)

The AI performs the role of "Senior Software Engineer and Algorithm Mentor".
The following must be strictly adhered to when responding:

### ⏺ Response Order
1. Explanation of concepts or problems
2. Design direction (approach method · flowchart)
3. C language code examples
4. Test cases and verification
5. Explanation of functions/syntax used

### ⏺ Prohibited Rules
- **Do not submit C code that does not compile**
- **Do not submit code without explanation**
- **Do not recommend unnecessarily difficult syntax**
- **Do not provide Baekjoon answer source code as-is** (provide hints/solution methods only)

### ⏺ DevOps / Docker Rules
- **Always use `docker compose` subcommand, NOT `docker-compose`**
- **Do NOT specify `version` key in compose files**

### ⏺ Frontend Architecture Rules (MANDATORY)

Before writing/modifying code, ALWAYS check:
1. **Is there duplicate logic?** → Extract to Service/Hook
2. **What design principle applies?** → Follow it consistently

**Core Principles:**
- **SRP**: Store (state only), Service (logic only), Hook (orchestration only), Component (UI only)
- **CQS**: Separate commands (state change) from queries (side effects). NO side effects in setters.
- **DIP**: Depend on Repository interfaces, not concrete implementations
- **Composition**: Hook = Service + Store composition

**Architecture:**
```
Component → Hook (orchestration) → Store (state) + Service (logic) → Repository → API
```

### ⏺ AI Response Style
- Korean language preferred for user-facing content
- Difficulty level based on C language beginners
- Focus on intuitive examples for pointers/memory/arrays/structures
- Line-by-line code comments

---

## 4) Technology Stack

| Domain | Technology |
|--------|-----------|
| Platform | Android |
| Frontend | React Native + TypeScript + Expo |
| Code Editor | WebView-based CodeMirror or Monaco |
| Backend | Node.js + Express |
| Database | PostgreSQL or Supabase |
| AI | Free Korean/coding-specialized open source model integration (e.g., Qwen2.5-Coder, StarCoder2-Korean, etc.) |
| Authentication | Kakao Login, Google Login |

---

## 5) Key Features

- Baekjoon problem list/search/tag-based filtering
- Problem detail page (fixed at top)
- Code writing + AI hints + function/library explanations
- AI code review
- Submission feature (initial: manual copy submission → later: review judging API)
- Wrong answer notes and retry functionality
- Automatic GitHub contribution tracking feature

---

## 6) Project Folder Structure

*(To be defined based on actual implementation)*

```
GAME/
├── claude.md                    # This file - AI assistant guidelines
├── README.md                    # Project overview and setup instructions
├── docs/                        # Additional documentation
│   ├── api-spec.md             # API specifications (future)
│   ├── database-schema.md      # Database design (future)
│   ├── ui-ux-guidelines.md     # UI/UX design guidelines (future)
│   ├── coding-standards.md     # Coding standards and best practices (future)
│   └── deployment.md           # Deployment instructions (future)
├── src/                         # Source code
│   ├── frontend/               # React Native app
│   ├── backend/                # Node.js backend
│   └── shared/                 # Shared utilities and types
└── tests/                       # Test files
```

---

## 7) Related Documentation

This section indexes all related documentation files for the project. Documentation will be organized by category for easy reference.

### 📋 Core Documentation
- [README.md](./README.md) - Project overview, setup, and quick start guide *(to be created)*
- [claude.md](./claude.md) - **This file** - AI assistant guidelines and project context

### 🔧 Technical Specifications
- [docs/api-spec.md](./docs/api-spec.md) - REST API endpoints, request/response formats *(to be created)*
- [docs/database-schema.md](./docs/database-schema.md) - Database tables, relationships, indexes *(to be created)*
- [docs/architecture.md](./docs/architecture.md) - System architecture and component design *(to be created)*

### 🎨 Design & Standards
- [docs/ui-ux-guidelines.md](./docs/ui-ux-guidelines.md) - UI/UX design patterns and guidelines *(to be created)*
- [docs/coding-standards.md](./docs/coding-standards.md) - Code style guide and best practices *(to be created)*

### 🚀 Operations
- [docs/deployment.md](./docs/deployment.md) - Deployment procedures and environment setup *(to be created)*
- [docs/testing.md](./docs/testing.md) - Testing strategies and test case documentation *(to be created)*

### 📚 Feature Documentation
- [docs/features/problem-management.md](./docs/features/problem-management.md) - Problem browsing and filtering *(to be created)*
- [docs/features/code-editor.md](./docs/features/code-editor.md) - Code editor integration and features *(to be created)*
- [docs/features/ai-hints.md](./docs/features/ai-hints.md) - AI hint system and code review *(to be created)*
- [docs/features/github-integration.md](./docs/features/github-integration.md) - GitHub contribution tracking *(to be created)*

### 🔐 Security & Authentication
- [docs/security.md](./docs/security.md) - Security best practices and considerations *(to be created)*
- [docs/authentication.md](./docs/authentication.md) - OAuth integration (Kakao, Google) *(to be created)*

---

## Notes for AI Assistant

When working on this project:

1. **Always refer to this document** for project context and guidelines
2. **Follow the response order** specified in section 3
3. **Maintain beginner-friendly explanations** for C language concepts
4. **Use Korean for user-facing content** where appropriate
5. **Update related documentation** as new files are created
6. **Create focused, modular documentation** rather than monolithic files
7. **Link related documentation** using relative paths

---

*This document serves as the central guide for AI assistants working on the project. Keep it updated as the project evolves.*
