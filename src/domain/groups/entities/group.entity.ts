import { generateUuidV8 } from '@app/shared/uuid';

export interface GroupSnapshot {
  id: string;
  externalId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupProps {
  externalId: string;
  description: string;
}

export interface UpdateGroupProps {
  externalId?: string;
  description?: string;
}

export class Group {
  private constructor(private props: GroupSnapshot) {}

  static create(props: CreateGroupProps): Group {
    return new Group({
      id: generateUuidV8(),
      externalId: props.externalId,
      description: props.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(snapshot: GroupSnapshot): Group {
    return new Group({ ...snapshot });
  }

  update(props: UpdateGroupProps): void {
    if (props.externalId !== undefined) {
      this.props.externalId = props.externalId;
    }

    if (props.description !== undefined) {
      this.props.description = props.description;
    }

    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  toJSON(): GroupSnapshot {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get externalId(): string {
    return this.props.externalId;
  }

  get description(): string {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
