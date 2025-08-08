export interface InstructionStep {
  id: number;
  description: string;
  command: string;
  expectedOutput?: string;
}

export interface Instruction {
  title: string;
  description: string;
  steps: InstructionStep[];
  tags: string[];
}

export class InstructionBuilder {
  private instruction: Partial<Instruction> = {
    steps: [],
    tags: []
  };

  setTitle(title: string): this {
    this.instruction.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.instruction.description = description;
    return this;
  }

  addStep(step: Omit<InstructionStep, 'id'>): this {
    const id = (this.instruction.steps?.length ?? 0) + 1;
    this.instruction.steps?.push({ id, ...step });
    return this;
  }

  addTag(tag: string): this {
    this.instruction.tags?.push(tag);
    return this;
  }

  build(): Instruction {
    if (!this.instruction.title || !this.instruction.description) {
      throw new Error('Title and description are required');
    }
    
    return this.instruction as Instruction;
  }
}

export function createInstruction(): InstructionBuilder {
  return new InstructionBuilder();
}
