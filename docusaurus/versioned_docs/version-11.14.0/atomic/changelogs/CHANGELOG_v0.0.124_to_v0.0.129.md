# Changelog: v0.0.124 to v0.0.129

## Overview

This changelog documents all changes between version 0.0.124 and version 0.0.129 of @sinequa/atomic, covering releases from December 3, 2025 to December 17, 2025.

**Total Changes:**

- 26 files changed
- 1,164 insertions(+)
- 516 deletions(-)

---

## [v0.0.129] - 2025-12-17

### Added

- New `selectedVisually` field to `AggregationItem` type for enhanced visual selection tracking

---

## [v0.0.128] - 2025-12-12

### Added

- New `getMetadataWithValues` function to return display-value pairs for metadata processing
- Support for parsing comma-separated strings in metadata values
- Comprehensive JSDoc examples for metadata functions

### Changed

- Enhanced metadata parsing with improved type safety and better filtering of undefined values
- Improved error response handling to include fallback `message` field
- Enhanced error handling with proper error type instantiation in `handleResponse`
- Code formatting improvements across multiple files

### Removed

- Redundant test assertion for `userOverrideActive` state

### Files Modified

- `src/helpers/metadata.ts` - Enhanced metadata parsing capabilities
- `src/web-api/helpers/handle-response.ts` - Improved error handling
- `src/types/principal/Principal.ts` - Type updates
- Test files for metadata functionality

---

## [v0.0.127] - 2025-12-10

### Added

- `useCredentials` bypass logic to app initializer
- New `fetch-app.test.ts` with app initializer functionality tests
- Dedicated error response processing helper function in web API
- Enhanced error logging for different HTTP status codes
- Support for credential-based authentication flow
- Improved error message extraction from response body

### Changed

- Extracted `useCredentials` from `globalConfig` with logic to skip pre-login fetch when credentials are used
- Sets appropriate flags (`useSSO: false`) and clears auto provider/token settings when `useCredentials` is enabled
- Improved error handling consistency with explicit return statements
- Enhanced error response processing with proper error type instantiation
- Better code formatting for function parameters and switch cases
- Replace wildcard logger import with specific error/warn functions

### Fixed

- **Security**: Prevent user impersonation during credential login - Temporarily disable user override during credential-based authentication to ensure JWT tokens contain the actual user identity rather than impersonated user data
- Redundant `userOverrideActive` reset in error handler removed

### Removed

- localStorage redirect URL assertions for OAuth and SAML in authentication tests
- OAuth redirect scenario test from `login.test.ts`

### Files Modified

- `src/authentication/session/login.ts` - Added credential authentication logic
- `src/authentication/session/tests/login.test.ts` - Updated tests
- `src/authentication/providers/tests/oauth-authentication.test.ts` - Removed assertions
- `src/authentication/providers/tests/saml-authentication.test.ts` - Removed assertions
- `src/web-api/helpers/handle-response.ts` - Major refactoring
- `src/web-api/helpers/index.ts` - Function organization
- `src/web-api/helpers/methods/post.ts` - Enhanced error handling
- `src/web-api/v1/fetch-app.ts` - Updated app initialization
- `src/web-api/helpers/tests/fetch-app.test.ts` - New test file

---

## [v0.0.126] - 2025-12-10

### Added

- Support for expired password handling
- Forgotten password functionality
- New `fetch-forgot-password.ts` API endpoint
- Enhanced change password functionality

### Changed

- Updated `fetch-change-password.ts` with improved error handling and validation
- Enhanced password management flow

### Files Modified

- `src/web-api/v2/fetch-change-password.ts` - Enhanced password change flow
- `src/web-api/v2/fetch-forgot-password.ts` - New forgot password endpoint
- `src/utils/notification.ts` - Updated notification handling

---

## [v0.0.125] - 2025-12-03

### Added

- New `columns.ts` helper with type conversion utilities for `EngineType` and `EngineTypeModifier`
- New `makeColumn` function for generating column configurations with engine-specific types
- `extraColumns` record with predefined column definitions for data processing
- Support for configurable included/excluded filters in filters bar
- New test files with better organization:
  - `src/helpers/tests/column-resolver.test.ts`
  - `src/helpers/tests/metadata.test.ts`
  - `src/web-api/helpers/tests/date-utils.test.ts`
  - `src/web-api/helpers/tests/handle-response.test.ts`
- New `date-utils.ts` utility file

### Changed

- Reorganized test files into dedicated `tests/` subdirectories for better project structure
- Moved `src/helpers/utils.test.ts` to `src/helpers/tests/utils.test.ts`
- Disabled biome's `useImportType` rule to allow mixed import styles
- Improved test coverage with 177 new test cases for handle-response
- Enhanced date utility functions

### Removed

- Old test files from root helper directories (moved to tests subdirectories):
  - `src/helpers/column-resolver.test.ts`
  - `src/helpers/metadata.test.ts`

### Files Modified

- `biome.json` - Updated linting rules
- `src/helpers/columns.ts` - New columns helper functionality
- `src/helpers/index.ts` - Export new columns helper
- `src/web-api/helpers/utils/date-utils.ts` - New date utilities
- Multiple test files reorganized and enhanced
- `package.json` & `package-lock.json` - Version bump

---

## Migration Notes

### Breaking Changes

None identified in this release cycle.

### Deprecations

None identified in this release cycle.

### Security Updates

- **v0.0.127**: Fixed user impersonation vulnerability during credential-based authentication. JWT tokens now correctly reflect the actual user identity instead of impersonated user data.

---

## Testing Updates

### New Test Files

1. `src/helpers/tests/column-resolver.test.ts` - 79 test cases
2. `src/helpers/tests/metadata.test.ts` - 144 test cases
3. `src/web-api/helpers/tests/date-utils.test.ts` - 36 test cases
4. `src/web-api/helpers/tests/fetch-app.test.ts` - 124 test cases
5. `src/web-api/helpers/tests/handle-response.test.ts` - 177 test cases

### Test Organization

- All test files moved into dedicated `tests/` subdirectories for improved project structure
- Enhanced test coverage for metadata parsing and error handling
- Removed redundant localStorage and OAuth redirect tests

---

## API Changes

### New Functions

- `getMetadataWithValues()` - Returns metadata display-value pairs (v0.0.128)
- `makeColumn()` - Generates column configurations (v0.0.125)
- Date utility functions in `date-utils.ts` (v0.0.125)

### New API Endpoints

- `fetch-forgot-password.ts` - Forgotten password functionality (v0.0.126)

### Modified Functions

- `handleResponse()` - Enhanced error handling with fallback message field (v0.0.128)
- `fetch-change-password.ts` - Improved password change flow (v0.0.126)
- `login.ts` - Added credential authentication support (v0.0.127)

---

## Type Updates

### New Fields

- `AggregationItem.selectedVisually` - Boolean field for visual selection tracking (v0.0.129)
- `Principal` type updates for improved type safety (v0.0.128)

### New Types

- Column configuration types for `EngineType` and `EngineTypeModifier` (v0.0.125)

---

## Documentation Updates

- Added comprehensive JSDoc examples for metadata functions (v0.0.128)
- Enhanced code documentation for error handling flows (v0.0.127)

---

## Dependencies

- Package version updates reflected in `package.json` and `package-lock.json`
- No major dependency changes

---

## Summary by Category

### 🚀 Features

- Credential-based authentication with useCredentials bypass logic
- Expired and forgotten password functionality
- Enhanced metadata parsing with comma-separated string support
- Configurable included/excluded filters for filters bar
- Visual selection tracking for aggregation items

### 🐛 Bug Fixes

- User impersonation vulnerability during credential login
- Error handling improvements with fallback message field
- Redundant code removal across authentication tests

### 🔧 Refactoring

- Test file organization into dedicated subdirectories
- Enhanced error response processing with dedicated helper functions
- Improved code formatting and type safety throughout
- Logger import optimization (specific functions vs wildcard imports)

### 📝 Documentation

- Added comprehensive JSDoc examples
- Enhanced inline code documentation

### 🧪 Testing

- Added 560+ new test cases across multiple modules
- Improved test organization and structure
- Enhanced test coverage for critical authentication and API flows

---

**For detailed commit history, please refer to the git log between tags v0.0.124 and HEAD.**
