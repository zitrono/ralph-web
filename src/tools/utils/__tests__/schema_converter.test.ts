/**
 * Unit tests for the schema_converter utility
 */

import { z } from 'zod';
import { convertZodSchemaToJsonSchema, enhanceJsonSchema } from '../schema_converter.js';

// Skip logger output during tests
jest.mock('../../../logging.js', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  __esModule: true,
  default: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('convertZodSchemaToJsonSchema', () => {
  test('should convert a simple Zod schema to JSON Schema', () => {
    // Create a simple schema
    const schema = z.object({
      name: z.string().describe('The name of the person'),
      age: z.number().min(0).max(120).describe('Age in years')
    });
    
    // Convert to JSON Schema
    const jsonSchema = convertZodSchemaToJsonSchema(schema, 'person');
    
    // Validate structure
    expect(jsonSchema).toBeDefined();
    expect(jsonSchema.type).toBe('object');
    expect(jsonSchema.properties).toBeDefined();
    expect(jsonSchema.properties.name).toBeDefined();
    expect(jsonSchema.properties.name.type).toBe('string');
    expect(jsonSchema.properties.name.description).toBe('The name of the person');
    expect(jsonSchema.properties.age).toBeDefined();
    expect(jsonSchema.properties.age.type).toBe('number');
    expect(jsonSchema.properties.age.minimum).toBe(0);
    expect(jsonSchema.properties.age.maximum).toBe(120);
    expect(jsonSchema.properties.age.description).toBe('Age in years');
  });
  
  test('should handle a complex schema with enums and optional fields', () => {
    // Create a complex schema
    const schema = z.object({
      name: z.string().describe('The name of the person'),
      status: z.enum(['active', 'inactive', 'pending']).describe('Account status'),
      email: z.string().email().optional().describe('Email address'),
      tags: z.array(z.string()).optional().describe('Associated tags')
    });
    
    // Convert to JSON Schema
    const jsonSchema = convertZodSchemaToJsonSchema(schema, 'person');
    
    // Validate structure
    expect(jsonSchema).toBeDefined();
    expect(jsonSchema.properties.status).toBeDefined();
    expect(jsonSchema.properties.status.enum).toEqual(['active', 'inactive', 'pending']);
    expect(jsonSchema.properties.email).toBeDefined();
    expect(jsonSchema.properties.tags).toBeDefined();
    expect(jsonSchema.properties.tags.type).toBe('array');
    expect(jsonSchema.properties.tags.items.type).toBe('string');
  });
  
  test('should return a minimal schema when conversion fails', () => {
    // Create a schema that might cause issues
    const schema = null as any;
    
    // Convert to JSON Schema
    const jsonSchema = convertZodSchemaToJsonSchema(schema, 'invalid');
    
    // Validate fallback structure
    expect(jsonSchema).toBeDefined();
    expect(jsonSchema.type).toBe('object');
    expect(jsonSchema.properties).toEqual({});
  });
});

describe('enhanceJsonSchema', () => {
  test('should add examples to properties', () => {
    // Create a base schema
    const baseSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the person'
        },
        email: {
          type: 'string',
          description: 'Email address'
        }
      }
    };
    
    // Define enhancements
    const enhancements = {
      name: {
        examples: ['John Doe', 'Jane Smith']
      },
      email: {
        examples: ['john.doe@example.com', 'jane.smith@example.com']
      }
    };
    
    // Enhance schema
    const enhancedSchema = enhanceJsonSchema(baseSchema, enhancements);
    
    // Validate enhancements
    expect(enhancedSchema.properties.name.examples).toEqual(['John Doe', 'Jane Smith']);
    expect(enhancedSchema.properties.email.examples).toEqual(['john.doe@example.com', 'jane.smith@example.com']);
  });
  
  test('should override descriptions', () => {
    // Create a base schema
    const baseSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Original description'
        }
      }
    };
    
    // Define enhancements
    const enhancements = {
      name: {
        description: 'Enhanced description with more details'
      }
    };
    
    // Enhance schema
    const enhancedSchema = enhanceJsonSchema(baseSchema, enhancements);
    
    // Validate enhancements
    expect(enhancedSchema.properties.name.description).toBe('Enhanced description with more details');
  });
  
  test('should add enum descriptions', () => {
    // Create a base schema
    const baseSchema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'pending'],
          description: 'Account status'
        }
      }
    };
    
    // Define enhancements
    const enhancements = {
      status: {
        enumDescriptions: {
          active: 'User is active and can log in',
          inactive: 'User has been deactivated',
          pending: 'User registration is pending approval'
        }
      }
    };
    
    // Enhance schema
    const enhancedSchema = enhanceJsonSchema(baseSchema, enhancements);
    
    // Validate enhancements
    expect(enhancedSchema.properties.status.enumDescriptions).toEqual({
      active: 'User is active and can log in',
      inactive: 'User has been deactivated',
      pending: 'User registration is pending approval'
    });
  });
  
  test('should not modify the original schema', () => {
    // Create a base schema
    const baseSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Original description'
        }
      }
    };
    
    // Make a copy for comparison
    const originalSchema = JSON.parse(JSON.stringify(baseSchema));
    
    // Define enhancements
    const enhancements = {
      name: {
        description: 'Enhanced description',
        examples: ['Example name']
      }
    };
    
    // Enhance schema
    enhanceJsonSchema(baseSchema, enhancements);
    
    // Validate original is unchanged
    expect(baseSchema).toEqual(originalSchema);
  });
  
  test('should handle enhancements for properties that don\'t exist', () => {
    // Create a base schema
    const baseSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    };
    
    // Define enhancements with a non-existent property
    const enhancements = {
      nonExistent: {
        description: 'This property doesn\'t exist',
        examples: ['Example']
      }
    };
    
    // Enhance schema
    const enhancedSchema = enhanceJsonSchema(baseSchema, enhancements);
    
    // Should still be valid and unchanged
    expect(enhancedSchema).toEqual(baseSchema);
  });
});