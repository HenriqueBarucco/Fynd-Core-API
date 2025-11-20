export interface EmbeddingResult {
  vector: number[];
  model: string;
}

export interface EmbeddingProvider {
  generateEmbedding(
    input: string,
    options?: { model?: string },
  ): Promise<EmbeddingResult>;
}
