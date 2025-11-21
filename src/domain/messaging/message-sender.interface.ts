export interface MessageSender {
  sendMessage(to: string, message: string): Promise<void>;
}
