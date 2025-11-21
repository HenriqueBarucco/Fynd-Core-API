export interface UserTasteLabelMetadata {
  /**
   * Enhanced, search-friendly representation of the taste label. Use as input for embeddings/search payloads.
   */
  searchLabel: string;
  /**
   * Original human-friendly label after basic cleanup. Useful for auditing/debugging.
   */
  originalLabel: string;
}

export interface UserTasteLabelEnhancer {
  enhance(label: string): Promise<UserTasteLabelMetadata>;
}
