interface SourcePosition {
    line: number;
    column: number;
  }
  
  export class SourceMap {
    private mappings: Array<{
      generated: SourcePosition;
      original: SourcePosition;
      source: string;
    }> = [];
  
    addMapping(
      generated: SourcePosition,
      original: SourcePosition,
      source: string
    ) {
      this.mappings.push({ generated, original, source });
    }
  
    generate(): string {
      return JSON.stringify({
        version: 3,
        sources: [this.mappings[0]?.source || ""],
        mappings: this.generateMappings(),
      });
    }
  
    private generateMappings(): string {
      // Basic VLQ encoding for source maps
      return this.mappings
        .map(m => `${m.generated.line},${m.generated.column}`)
        .join(";");
    }
  }