import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('Role-Based Access Control API Tests', () => {
  describe('Admin Routes', () => {
    it('should block CITIZEN from accessing /api/audit-logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('x-demo-role', 'CITIZEN');
        
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('should allow ADMIN to access /api/audit-logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('x-demo-role', 'ADMIN');
        
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should block CITIZEN from accessing /api/dev/reset', async () => {
      const res = await request(app)
        .post('/api/dev/reset')
        .set('x-demo-role', 'CITIZEN');
        
      expect(res.status).toBe(403);
    });
  });

  describe('Officer Routes', () => {
    it('should block CITIZEN from assigning officers to complaints', async () => {
      const res = await request(app)
        .patch('/api/complaints/GRV-2026-00001/assign')
        .send({ officerId: 'officer-1' })
        .set('x-demo-role', 'CITIZEN');
        
      expect(res.status).toBe(403);
    });
    
    it('should block CITIZEN from changing complaint statuses as an officer', async () => {
      const res = await request(app)
        .patch('/api/complaints/GRV-2026-00001/status')
        .send({ status: 'Resolved' })
        .set('x-demo-role', 'CITIZEN');
        
      expect(res.status).toBe(403);
    });
    
    it('should allow ADMIN to assign officers', async () => {
      const res = await request(app)
        .patch('/api/complaints/GRV-2026-00001/assign')
        .send({ officerId: 'off-101' })
        .set('x-demo-role', 'ADMIN');
        
      // Expect either 200 (if GRV exists) or 404 (if not found in local db), but NOT 403
      expect(res.status).not.toBe(403);
    });
  });

  describe('Citizen Routes', () => {
    it('should allow CITIZEN to get complaints', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('x-demo-role', 'CITIZEN');
        
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
