# Family Weekly

Family Weekly turns a small set of explicitly submitted family photographs and optional captions into a private, accessible printed newspaper for one older adult. This repository is a portfolio-quality, local-first prototype. It includes fictional sample families and also lets someone choose photographs from their own device.

The loop is:

**Set preferences → Contribute → Build → Approve when needed → Print → Deliver → Read, keep, and annotate → Optionally share a reply**

The older adult is a participant, not a monitored subject. Family Weekly never scores or infers loneliness, health, cognition, mood, safety, family quality, or digital ability.

## Prototype boundaries

- Personal photos may be selected for a local preview on a trusted device. They stay in browser memory, are never uploaded by the app, and disappear when the tab closes or the issue is cleared.
- The sample family identities are fictional. Replace their identifying details before creating a personal issue, and confirm permission for every selected photograph.
- Three fictional workspaces are included, and each produces a separate private issue.
- No backend, accounts, database, analytics, remote logging, or persistent browser storage.
- Local file selections remain in browser memory and their object URLs are revoked when replaced, removed, reset, or unloaded.
- Refreshing or closing the tab discards working state.
- All messaging, preview, approval, delivery, and reply actions are honest simulations or manual records. The printed issue is for one older adult recipient, and no reply is required.

## Install and run

Requirements: Node.js 20 or newer and npm.

```powershell
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://127.0.0.1:4173`.

## Checks

```powershell
npm run format
npm run typecheck
npm test
npm run build
```

## Manual pilot workflow

1. Select a fictional family workspace.
2. Review the sample stories, or choose up to four photos from the device. Select multiple files in one picker; captions are optional and editable.
3. Confirm permission to share each selected photo.
4. Compare original and edited captions, and optionally request a predefined demonstration suggestion.
5. Arrange stories in the Issue builder.
6. Send the simulated curator preview, then approve the first issue.
7. Open browser print and record the manual handoff status.
8. Optionally record a handwritten card, voice capture at delivery, or supported phone reply. Confirm the exact wording and recipients.
9. Start the next issue. Only an approved “Include in next issue” reply carries forward.
10. Reset the demonstration data.

## AI boundaries

`CaptionAssistant` separates direct editing from future assisted editing. `DemoCaptionAssistant` recognizes only the included synthetic captions and returns predefined suggestions. It makes no network request and never receives images.

AI may eventually suggest grammar, shortening, translation drafts, headlines, or ordering. It may never identify people, infer relationships or personal conditions, choose important events, invent facts, generate the older adult's reply, or approve, publish, or print.

## Messaging-channel boundaries

`ChannelAdapter` defines `manual`, `whatsapp`, `wechat`, `imessage`, and `email` channel types. Only `ManualChannelAdapter` works in the prototype, and it copies text after an explicit button press. Other adapters remain disconnected.

The prototype does not open or read group conversations, import history, monitor activity, send platform requests, or claim delivery. The displayed `example.invalid` links are visibly inactive demonstrations.

## Privacy model

All state is initialized in JavaScript memory. The application does not call `localStorage`, `sessionStorage`, IndexedDB, cookies, analytics, external APIs, or a backend. Family data is not encoded into the browser URL. Chosen photos use temporary browser object URLs that are revoked when they are replaced, removed, cleared, or unloaded. The bundled photo contact sheet was generated for this fictional demonstration and is served locally.

The pilot-wide limit is 50 accepted photographs. Each issue may select no more than four items. Approval is blocked when identity or required attestations are missing.

## Print instructions

1. Correct all validation errors.
2. Send the simulated curator preview and select **Approve issue**.
3. Select **Open browser print**.
4. In the browser dialog, choose Letter or A4 to match the workspace setting, enable background graphics, use 100% scale, and print double-sided with a long-edge flip.

Print CSS hides navigation and controls, preserves 16pt, 18pt, or 20pt body text, and emits two pages. Each page includes the family and recipient identity. Fewer stories are used instead of shrinking text.

## Simulated, manual, and connected

| Capability                          | Prototype state                    |
| ----------------------------------- | ----------------------------------- |
| Family workspaces and issue builder | Working locally in memory           |
| Local photo selection               | Working locally; never uploaded     |
| Caption suggestions                 | Working, predefined demonstration   |
| Curator preview and approval        | Simulated status workflow           |
| Browser print                       | Working local browser capability    |
| Delivery and receipt                | Manual operator record only         |
| Clipboard messages                  | Working after explicit button press |
| WhatsApp, WeChat, iMessage, email   | Not connected                       |
| Replies                             | Synthetic manual record only        |
| Backend, accounts, persistence      | Not implemented                     |

## Known limitations

- Print margins and duplex controls vary by browser and printer.
- The app cannot confirm that a copied message was pasted or delivered.
- There is no multi-user collaboration or conflict handling.
- There is no real secure submission link, authentication, or access control.
- Personal-photo previews should be created only on a trusted device; there is no account, access control, recovery, or persistence.
- Caption translations are predefined demonstrations, not a language service.

## Stage 1 requirements

Before accepting real family data from other people or adding remote submission and persistence, complete a separate privacy and security review. Stage 1 needs approved hosting and access control, a real consent and withdrawal process, encrypted transport and storage, retention and deletion operations, secure family-specific links, incident handling, tested print and delivery procedures, and explicit approval of any server-side AI provider. The three-family service should remain manually operated.

Future WhatsApp and WeChat adapters should begin as reviewed server-side link-sharing tools. They must not ingest chats or request conversation access. Connection work starts only after the manual workflow is proven and the relevant platform, consent, credential, and privacy requirements are approved.

The service source of truth is [FAMILY_WEEKLY_SERVICE_DESIGN.md](./FAMILY_WEEKLY_SERVICE_DESIGN.md). Implementation decisions that change the product premise belong there first.
