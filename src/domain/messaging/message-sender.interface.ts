import { File } from './file.interface';

export interface MessageSender {
  sendMessage(to: string, message: string, image?: File): Promise<void>;
}
