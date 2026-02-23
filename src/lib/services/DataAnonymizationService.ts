import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface AnonymizedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AnonymizationMapping {
  original_value: string;
  anonymized_value: string;
  type: string;
  created_at: Date;
}

const FAKE_NAMES = [
  'Alex Johnson', 'Bailey Smith', 'Casey Williams', 'Dakota Brown', 'Emerson Davis',
  'Finley Miller', 'Greyson Wilson', 'Harper Moore', 'Indigo Taylor', 'Jordan Anderson',
  'Kai Thomas', 'Logan Jackson', 'Morgan White', 'Nolan Harris', 'Oakley Martin',
  'Parker Thompson', 'Quinn Garcia', 'Riley Martinez', 'Sage Robinson', 'Taylor Clark',
];

const FAKE_DOMAINS = ['example.com', 'test.com', 'sample.com', 'demo.com', 'staging.com'];

export class DataAnonymizationService {
  private mappingCache: Map<string, string> = new Map();

  constructor(private pool: Pool) {}

  /**
   * Generate fake name
   */
  generateFakeName(): string {
    return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  }

  /**
   * Generate fake email
   */
  generateFakeEmail(): string {
    const randomId = Math.random().toString(36).substring(2, 10);
    const domain = FAKE_DOMAINS[Math.floor(Math.random() * FAKE_DOMAINS.length)];
    return `user_${randomId}@${domain}`;
  }

  /**
   * Generate fake phone number
   */
  generateFakePhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1${areaCode}${exchange}${number}`;
  }

  /**
   * Get or create anonymization mapping
   */
  async getOrCreateMapping(original: string, type: 'name' | 'email' | 'phone'): Promise<string> {
    const cacheKey = `${type}:${original}`;

    // Check cache first
    if (this.mappingCache.has(cacheKey)) {
      return this.mappingCache.get(cacheKey)!;
    }

    // Check database
    const result = await this.pool.query(
      `SELECT anonymized_value FROM anonymization_mappings 
       WHERE original_value = $1 AND type = $2`,
      [original, type]
    );

    if (result.rows.length > 0) {
      const anonymized = result.rows[0].anonymized_value;
      this.mappingCache.set(cacheKey, anonymized);
      return anonymized;
    }

    // Generate new anonymized value
    let anonymized: string;
    switch (type) {
      case 'name':
        anonymized = this.generateFakeName();
        break;
      case 'email':
        anonymized = this.generateFakeEmail();
        break;
      case 'phone':
        anonymized = this.generateFakePhone();
        break;
    }

    // Store mapping
    await this.pool.query(
      `INSERT INTO anonymization_mappings (id, original_value, anonymized_value, type)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), original, anonymized, type]
    );

    this.mappingCache.set(cacheKey, anonymized);
    return anonymized;
  }

  /**
   * Anonymize user data
   */
  async anonymizeUsers(users: any[]): Promise<AnonymizedUser[]> {
    const anonymized: AnonymizedUser[] = [];

    for (const user of users) {
      const anonymizedName = await this.getOrCreateMapping(user.name, 'name');
      const anonymizedEmail = await this.getOrCreateMapping(user.email, 'email');
      const anonymizedPhone = user.phone
        ? await this.getOrCreateMapping(user.phone, 'phone')
        : undefined;

      anonymized.push({
        id: user.id,
        name: anonymizedName,
        email: anonymizedEmail,
        phone: anonymizedPhone,
      });
    }

    return anonymized;
  }

  /**
   * Anonymize assignment data
   */
  async anonymizeAssignments(assignments: any[]): Promise<any[]> {
    const anonymized: any[] = [];

    for (const assignment of assignments) {
      // Anonymize user-related fields if present
      const anonymizedAssignment = { ...assignment };

      if (assignment.user_name) {
        anonymizedAssignment.user_name = await this.getOrCreateMapping(assignment.user_name, 'name');
      }
      if (assignment.user_email) {
        anonymizedAssignment.user_email = await this.getOrCreateMapping(assignment.user_email, 'email');
      }

      anonymized.push(anonymizedAssignment);
    }

    return anonymized;
  }

  /**
   * Generate fake data
   */
  async generateFakeData(type: 'name' | 'email' | 'phone', count: number): Promise<string[]> {
    const data: string[] = [];

    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'name':
          data.push(this.generateFakeName());
          break;
        case 'email':
          data.push(this.generateFakeEmail());
          break;
        case 'phone':
          data.push(this.generateFakePhone());
          break;
      }
    }

    return data;
  }

  /**
   * Create anonymization mapping
   */
  async createMapping(original: string, anonymized: string, type: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO anonymization_mappings (id, original_value, anonymized_value, type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (original_value, type) DO NOTHING`,
      [uuidv4(), original, anonymized, type]
    );

    const cacheKey = `${type}:${original}`;
    this.mappingCache.set(cacheKey, anonymized);
  }

  /**
   * Get anonymization mapping
   */
  async getMapping(original: string, type: string): Promise<string | null> {
    const cacheKey = `${type}:${original}`;

    if (this.mappingCache.has(cacheKey)) {
      return this.mappingCache.get(cacheKey)!;
    }

    const result = await this.pool.query(
      `SELECT anonymized_value FROM anonymization_mappings 
       WHERE original_value = $1 AND type = $2`,
      [original, type]
    );

    if (result.rows.length > 0) {
      const anonymized = result.rows[0].anonymized_value;
      this.mappingCache.set(cacheKey, anonymized);
      return anonymized;
    }

    return null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.mappingCache.clear();
  }
}
