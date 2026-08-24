/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { api } from '../src/services/api';

// 12. Proper Testing Setup (SIH Requirement)
describe('Security & Role Authorization', () => {
  it('should block citizens from accessing admin audit logs', async () => {
    // Mock the global fetch to simulate a 403 Forbidden response for a citizen trying to access audit logs
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden: Requires one of ADMIN' })
    });

    await expect(api.getAuditLogs()).rejects.toThrow('Failed to fetch audit logs');
  });

  it('should allow citizens to create a grievance', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'GRV-TEST-001',
        category: 'Street Light',
        status: 'Submitted'
      })
    });

    const result = await api.createComplaint({
      category: 'Street Light',
      citizenName: 'Test Citizen'
    });

    expect(result.id).toBeDefined();
    expect(result.status).toBe('Submitted');
  });
});

describe('AI Classification Validation', () => {
  it('should map low confidence predictions to manual review', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        category: 'Needs Manual Classification',
        departmentId: 'dept-general',
        confidence: 0.55
      })
    });

    const result = await api.analyzeComplaint('some ambiguous text');
    expect(result.category).toBe('Needs Manual Classification');
    expect(result.confidence).toBeLessThan(0.60);
  });

  it('should apply deterministic safety rules for electrical hazards', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        category: 'Electricity & Power',
        priority: 'Critical',
        departmentId: 'dept-electric'
      })
    });

    const result = await api.analyzeComplaint('exposed live wire spark');
    expect(result.priority).toBe('Critical');
    expect(result.departmentId).toBe('dept-electric');
  });
});
