export interface CaptionSuggestion {
  label: "Demonstration suggestion";
  text: string;
}

export interface CaptionAssistant {
  readonly name: string;
  readonly available: boolean;
  suggest(originalCaption: string): CaptionSuggestion | undefined;
}

export class ManualCaptionAssistant implements CaptionAssistant {
  readonly name = "Manual editing";
  readonly available = true;
  suggest(): undefined {
    return undefined;
  }
}

const suggestions = new Map<string, string>([
  [
    "We spread out the old quilt and ate lunch under the maple tree on Sunday.",
    "Sunday lunch was a picnic under the maple tree, with the old quilt and everyone together.",
  ],
  [
    "Mina decided the living room needed a fort and recruited everybody after breakfast.",
    "After breakfast, Mina recruited everyone to build a living-room fort.",
  ],
  [
    "The raspberry cake leaned a little but it tasted great and we saved you a story about it.",
    "The raspberry cake leaned a little, tasted wonderful, and gave us a story to save for you.",
  ],
  [
    "Pepper took us around the lake and tried to collect every bright leaf on the path.",
    "Pepper led us around the lake, stopping for every bright leaf along the path.",
  ],
]);

export class DemoCaptionAssistant implements CaptionAssistant {
  readonly name = "Demonstration caption assistant";
  readonly available = true;

  suggest(originalCaption: string): CaptionSuggestion | undefined {
    const text = suggestions.get(originalCaption);
    return text ? { label: "Demonstration suggestion", text } : undefined;
  }
}
