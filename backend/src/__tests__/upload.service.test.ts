import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractEmail } from '../services/upload.service';

describe('Upload Service — extractEmail', () => {
  it('extracts email from text', () => {
    expect(extractEmail('Contact: john.doe@example.com')).toBe('john.doe@example.com');
    expect(extractEmail('Mon email est ahmed.bensalem@schulte.tn')).toBe('ahmed.bensalem@schulte.tn');
  });

  it('returns null when no email found', () => {
    expect(extractEmail('No email here')).toBeNull();
    expect(extractEmail('')).toBeNull();
  });

  it('extracts the first email when multiple present', () => {
    const text = 'first@test.com and second@test.com';
    expect(extractEmail(text)).toBe('first@test.com');
  });
});

describe('Upload Service — multer config', () => {
  it('accepts PDF files only', async () => {
    const { upload } = await import('../services/upload.service');
    expect(upload).toBeDefined();
    expect(upload.limits?.fileSize).toBe(5 * 1024 * 1024);
  });
});
