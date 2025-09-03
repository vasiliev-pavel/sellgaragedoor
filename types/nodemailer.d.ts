declare module "nodemailer" {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface Attachment {
    filename: string;
    content: Buffer;
    cid: string;
  }

  export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: Attachment[];
  }

  export interface Transporter {
    verify(): Promise<boolean>;
    sendMail(mailOptions: MailOptions): Promise<any>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}
