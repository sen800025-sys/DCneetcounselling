# Antigravity Agent – Master Development Safety & Change Protocol

## Purpose of This File

This document defines **mandatory operating rules** for the Antigravity Agent when working on a complex website codebase. The agent MUST read this document **before making any change**, **creating new files**, **editing existing logic**, or **deploying updates**.

The goal is to ensure:

* No breaking changes
* No dependency conflicts
* Continuous website uptime
* Predictable system behavior
* Safe scaling of features

This file acts as the **primary safety contract** between the agent and the codebase.

---

# Core Rule: Always Read Before Changing Anything

Before creating, modifying, deleting, or restructuring ANY file:

The agent MUST:

1. Read this document
2. Analyze project structure
3. Identify dependencies
4. Check integration impact
5. Validate compatibility
6. Confirm no regression risk

No change is allowed without completing these steps.

---

# Stability First Principle

System stability has higher priority than:

* speed
* feature expansion
* UI improvements
* refactoring
* optimization

If a change risks breaking another component, it MUST NOT be applied.

---

# Mandatory Dependency Awareness Rule

Before editing any component:

Agent MUST check:

* where the file is imported
* what imports the file
* shared utilities usage
* API contracts
* database schema dependencies
* environment variables
* config usage

Then confirm:

"This change will NOT break other modules."

If uncertain → do not modify.

---

# Continuous Functionality Guarantee Rule

After every change:

Agent MUST verify:

* build success
* runtime success
* routing success
* API response correctness
* authentication still works
* database queries still work
* UI renders correctly
* console contains zero new errors

Website must remain operational at all times.

---

# File Creation Policy

When creating new files:

Agent MUST:

Follow existing structure
Follow naming conventions
Avoid duplicate utilities
Reuse shared modules first
Document purpose of file
Register file in correct architecture layer

Never create unnecessary files.

---

# File Editing Policy

Before editing any file:

Agent MUST determine:

Purpose of file
Scope of usage
Connected modules
Side effects risk
Backward compatibility impact

Then apply minimal safe change.

---

# Backward Compatibility Rule

All changes must preserve:

existing APIs
existing routes
existing database schema behavior
existing integrations
existing UI flows

Breaking changes require migration handling.

---

# Error Prevention Strategy

Agent must always:

Check null cases
Validate inputs
Handle async failures
Handle network failures
Prevent race conditions
Avoid circular dependencies
Prevent memory leaks

Never assume safe inputs.

---

# Logging Rule

Every major change must include:

clear logging
error boundary handling
fallback logic
recovery-safe behavior

Logs must help debugging without exposing sensitive data.

---

# Performance Protection Rule

Agent must NOT introduce:

unnecessary re-renders
duplicate API calls
blocking operations
large bundle increases
unoptimized database queries
memory-heavy loops

Performance regressions are not allowed.

---

# Security Protection Rule

Agent must always verify:

input sanitization
authentication integrity
authorization checks
secure API usage
no secret exposure
no token leakage
no unsafe eval usage

Security cannot be reduced for convenience.

---

# Database Safety Rule

Before modifying database logic:

Agent MUST:

check schema usage
check migrations
check foreign key relations
check indexing impact
confirm rollback plan exists

Never modify schema without compatibility plan.

---

# API Safety Rule

Before modifying APIs:

Agent MUST:

confirm request format stability
confirm response format stability
preserve status codes
preserve authentication expectations
maintain backward compatibility

API contracts must remain reliable.

---

# UI Safety Rule

UI changes must NOT:

break layout responsiveness
break accessibility
break navigation flow
break form validation
break mobile compatibility

Visual updates must remain functional.

---

# Testing Rule (Mandatory)

After each change agent MUST verify:

no console errors
no build errors
no runtime errors
no broken routes
no broken imports
no missing environment variables

If tests exist → run them.
If tests missing → simulate logic validation.

---

# Change Impact Simulation Rule

Before applying change agent must simulate:

What depends on this?
What could break?
What if API fails?
What if DB returns null?
What if config missing?

Then implement safe handling.

---

# Rollback Safety Rule

Every change must allow:

instant rollback
partial rollback
safe fallback behavior

System must never become unrecoverable.

---

# Documentation Update Rule

Whenever agent changes:

logic
API
schema
config
workflow
folder structure

Agent MUST update documentation accordingly.

---

# Intelligent Change Strategy (Recommended by ChatGPT)

Before implementing features:

Agent SHOULD:

map feature dependencies
estimate risk level
choose safest implementation path
reuse existing architecture
prefer modular updates
avoid global side-effects
stage rollout when possible

---

# Continuous Availability Requirement

Website must remain:

available
stable
consistent
recoverable
maintainable
scalable

Agent must prioritize reliability above experimentation.

---

# Final Execution Rule

Before finalizing ANY modification:

Agent must confirm:

"This change does not break any existing functionality and keeps the system stable."

Only then deployment is allowed.

---

# Priority Order For Decision Making

When conflicts occur agent must prioritize:

1 Stability
2 Security
3 Compatibility
4 Performance
5 Maintainability
6 Feature delivery

Never reverse this order.

---

# Mobile Responsiveness Mandatory Rule (Antigravity Agent)

## Purpose

This rule ensures the website always remains fully mobile-responsive across all devices. No UI change is allowed if it breaks responsiveness.

## Core Requirement

Before finalizing ANY UI change, layout change, component update, or styling update:

Agent MUST verify the website works correctly on:

* mobile phones
* small tablets
* large tablets
* laptops
* desktops

Responsive compatibility is mandatory and cannot be skipped.

## Layout Protection Rules

Agent MUST ensure:

* no horizontal scrolling on mobile screens
* no overlapping UI elements
* no broken grids or containers
* no hidden important content
* no clipped text or buttons
* no overflow outside viewport

If detected → fix before deployment.

## Typography Responsiveness Rules

Agent MUST verify:

* readable font sizes on small screens
* scalable typography using responsive units
* proper spacing between text blocks
* no text overflow or truncation

Typography must remain readable on all devices.

## Touch Interaction Rules

Agent MUST ensure:

* buttons are tap-friendly
* clickable areas are large enough
* spacing prevents accidental taps
* dropdowns work on touch screens
* navigation menus open correctly on mobile

Mouse-only interaction logic is not allowed.

## Media Responsiveness Rules

Agent MUST ensure:

* images scale correctly
* videos remain visible and proportional
* icons do not stretch
* no media overflow containers
* responsive image sizing applied

## Navigation Responsiveness Rules

Agent MUST verify:

* mobile navigation menu works
* hamburger menu functions correctly
* no broken routing on mobile
* header remains usable
* footer remains readable

Navigation failure on mobile is critical.

## Form Responsiveness Rules

Agent MUST ensure:

* inputs remain visible on small screens
* keyboard does not block fields
* labels remain readable
* submit buttons accessible
* validation messages visible

Forms must remain usable on all devices 📱

## Breakpoint Testing Requirement

Before deployment agent MUST simulate:

* small mobile viewport
* medium mobile viewport
* tablet viewport
* laptop viewport
* large desktop viewport

Failure at any breakpoint blocks release.

## Orientation Change Rule

Agent MUST verify layout stability during:

* portrait mode
* landscape mode

Layout shifting or breaking is not allowed 🔄

## Style Isolation Guarantee

Agent MUST ensure that mobile-specific styling (inside media queries) DOES NOT bleed into or negatively impact the desktop (web) version.

*   Always use specific media queries (e.g., `@media (max-width: ...px)`) for mobile logic.
*   Verify desktop layout after every mobile adjustment.
*   Prevent mobile-only features (like hamburger menus) from appearing on large screens.
*   Ensure desktop-specific features (like multi-column grids) remain optimized for large-scale views.

The web (desktop) version MUST remain elite, professional, and unaffected by mobile-specific tweaks.

Only then deployment is allowed ✅

---

# End of Mandatory Agent Instructions

This file must always be reviewed before implementing any system change.

Failure to follow this protocol risks system instability and is not allowed.

---

# Blog Download Button Styling Rule

When creating or modifying blog posts, Agent MUST:

* Always style download buttons with a green background (e.g., background:#28a745)
* Always style download buttons with white text (e.g., color:#ffffff)

This applies to all anchor links or buttons meant for downloading files in blog contents.
