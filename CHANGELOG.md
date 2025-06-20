# Changelog

All notable changes to the Cloze MCP server will be documented in this file.

## [Unreleased]

### Added
- Enhanced schema validation system with better error messages and examples
- Schema converter utility for Zod to JSON Schema conversion
- Client-side validation to catch errors before server calls
- Comprehensive MCP client for testing the complete server
- Schema verification script to check all tools
- Tool standardization scripts for consistent implementation
- Unit tests for schema converter
- ESM version of schema test client
- Extensive documentation for schema validation system

### Changed
- Standardized schema implementation across all tools
- Updated server.js to properly register tool schemas
- Enhanced error messages with examples and descriptions
- Improved parameter validation with enhanced middleware

### Fixed
- Schema transmission issues in MCP protocol
- Missing schema registration for tools
- Inconsistent schema implementations between tools
- Validation errors not providing helpful feedback

## [1.0.0] - 2023-12-15

### Added
- Initial release of Cloze MCP server
- Tool implementation for people, companies, projects
- API client for Cloze API
- Test runner for workflow tests
- Basic parameter validation