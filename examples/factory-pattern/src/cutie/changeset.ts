export interface ChangesetMetadata {
  id: string;
  timestamp: Date;
  author: string;
}

export interface ChangesetEntry {
  type: 'added' | 'modified' | 'deleted';
  path: string;
  content?: string;
}

export class ChangesetProcessor {
  constructor(private metadata: ChangesetMetadata) {}

  processEntries(entries: ChangesetEntry[]): void {
    console.log(`Processing ${entries.length} changeset entries for ${this.metadata.id}`);
    // Implementation would go here
  }

  getMetadata(): ChangesetMetadata {
    return { ...this.metadata };
  }
}

export function createChangeset(author: string): ChangesetProcessor {
  const metadata: ChangesetMetadata = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    author
  };
  
  return new ChangesetProcessor(metadata);
}
