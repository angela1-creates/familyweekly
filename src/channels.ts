import type { Channel } from "./model";

export interface ChannelResult {
  ok: boolean;
  message: string;
}

export interface ChannelAdapter {
  readonly id: Channel;
  readonly label: string;
  readonly status: string;
  copy(text: string, userInitiated: boolean): Promise<ChannelResult>;
}

export class ManualChannelAdapter implements ChannelAdapter {
  readonly id = "manual" as const;
  readonly label = "Manual copy";
  readonly status = "Available in prototype";

  constructor(
    private readonly writer: (text: string) => Promise<void> = (text) =>
      navigator.clipboard.writeText(text),
  ) {}

  async copy(text: string, userInitiated: boolean): Promise<ChannelResult> {
    if (!userInitiated) {
      return { ok: false, message: "Copy requires an explicit button press." };
    }
    await this.writer(text);
    return { ok: true, message: "Copied. Paste it into your chosen channel." };
  }
}

export class PlaceholderChannelAdapter implements ChannelAdapter {
  readonly status = "Not connected in prototype";

  constructor(
    readonly id: Exclude<Channel, "manual">,
    readonly label: string,
  ) {}

  async copy(): Promise<ChannelResult> {
    return {
      ok: false,
      message: `${this.label} is not connected in the prototype. Use manual copy.`,
    };
  }
}

export const channelAdapters: Record<Channel, ChannelAdapter> = {
  manual: new ManualChannelAdapter(),
  whatsapp: new PlaceholderChannelAdapter("whatsapp", "WhatsApp"),
  wechat: new PlaceholderChannelAdapter("wechat", "WeChat"),
  imessage: new PlaceholderChannelAdapter("imessage", "iMessage"),
  email: new PlaceholderChannelAdapter("email", "Email"),
};
