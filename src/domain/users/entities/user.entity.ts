import { generateUuidV8 } from '@app/shared/uuid';

export interface UserSnapshot {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  name: string;
  phone: string;
}

export interface UpdateUserProps {
  name?: string;
  phone?: string;
}

export class User {
  private constructor(private props: UserSnapshot) {}

  static create(props: CreateUserProps): User {
    return new User({
      id: generateUuidV8(),
      name: props.name,
      phone: props.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(snapshot: UserSnapshot): User {
    return new User({ ...snapshot });
  }

  update(props: UpdateUserProps): void {
    if (props.name !== undefined) {
      this.props.name = props.name;
    }

    if (props.phone !== undefined) {
      this.props.phone = props.phone;
    }

    this.touch();
  }

  touch(): void {
    this.props.updatedAt = new Date();
  }

  toJSON(): UserSnapshot {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
