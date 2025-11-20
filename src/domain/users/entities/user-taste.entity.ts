import { generateUuidV8 } from '@app/shared/uuid';

export interface UserTasteSnapshot {
  id: string;
  userId: string;
  label: string;
  normalizedLabel: string;
  embeddingModel: string;
  qdrantPointId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserTasteProps {
  userId: string;
  label: string;
  embeddingModel: string;
}

export class UserTaste {
  private constructor(private props: UserTasteSnapshot) {}

  static create(props: CreateUserTasteProps): UserTaste {
    const now = new Date();
    const label = props.label.trim();

    const tasteId = generateUuidV8();

    return new UserTaste({
      id: tasteId,
      userId: props.userId,
      label,
      normalizedLabel: UserTaste.normalizeLabel(label),
      embeddingModel: props.embeddingModel,
      qdrantPointId: tasteId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: UserTasteSnapshot): UserTaste {
    return new UserTaste({ ...snapshot });
  }

  static normalizeLabel(value: string): string {
    return value.trim().toLowerCase();
  }

  updateLabel(label: string): void {
    const trimmed = label.trim();
    this.props.label = trimmed;
    this.props.normalizedLabel = UserTaste.normalizeLabel(trimmed);
    this.touch();
  }

  updateEmbeddingModel(model: string): void {
    this.props.embeddingModel = model;
    this.touch();
  }

  touch(): void {
    this.props.updatedAt = new Date();
  }

  toJSON(): UserTasteSnapshot {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get label(): string {
    return this.props.label;
  }

  get normalizedLabel(): string {
    return this.props.normalizedLabel;
  }

  get embeddingModel(): string {
    return this.props.embeddingModel;
  }

  get qdrantPointId(): string {
    return this.props.qdrantPointId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
