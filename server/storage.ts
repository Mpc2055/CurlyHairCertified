// Storage interface - currently unused but kept for future expansion
export interface IStorage {
  // Add storage methods as needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Future storage implementation
  }
}

export const storage = new MemStorage();
