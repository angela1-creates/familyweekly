# Family Weekly: Manual-First MVP Service Specification

Status: DRAFT FOR APPROVAL  
Date: 2026-09-08  
Stage: Pre-implementation

## 1. Product thesis

Family Weekly helps one older adult stay meaningfully involved in family life when the family's everyday communication happens in fast digital channels they do not comfortably use.

The service turns a small set of explicitly submitted family photographs and captions into a private, accessible weekly newspaper for one older adult recipient. The recipient can read, keep, and annotate it without technology. Responses are optional: a handwritten card is the primary share-back method in Stage 0, with voice capture during delivery as a supported alternative.

Each family has its own issue dedicated to its one older-adult recipient. Families are never combined into a shared newspaper, preview, PDF, print job, or response thread. During Stage 1, three families produce 12 separate issues: one issue per family per week for four weeks.

The MVP tests the communication loop, not institutional scale. Success means the recipients say they feel more connected and gain confidence performing one meaningful action. It is not the number of newspapers produced.

The pilot accepts no more than 50 real photographs in total. The planned maximum is 48 publication slots: three families, four weekly issues, and four photo-caption items per issue. Excess photographs are not accepted for the pilot.

## 2. Three required roles

### Older adult recipient

The primary user. The recipient chooses whether to participate, who may contribute, what subjects to avoid, their preferred name and language, text size, delivery method, and response method. They may pause, skip an issue, request a preview, change preferences, or leave without explanation.

Receiving an issue never creates an obligation to reply. Asking for help is not treated as evidence of inability. Family Weekly does not assess or infer health, mood, cognition, loneliness, relationships, or safety.

### Family curator and invited contributors

Each family names one curator. The curator invites contributors, shares the submission link, resolves duplicate or excess submissions, and approves the complete issue before printing.

A contributor submits only photographs and captions they intentionally choose to share. The curator does not speak for the older adult and cannot approve the older adult's reply.

### Angela/operator

Angela operates the service from submission through deletion. She checks submissions, edits caption text, prepares each family's separate issue, sends the preview, records approval, prints, performs the selected delivery handoff, collects replies, and removes pilot material on schedule.

Angela may use AI within the limits below but remains responsible for every word and layout choice. A senior center, volunteer, print vendor, translator, or delivery partner is optional, not required for Stage 0 or Stage 1.

## 3. Pilot progression

### Stage 0: tabletop rehearsal

Use invented content only. Produce one complete sample issue and run it through submission, caption editing, layout, curator approval, printing, simulated delivery, reply capture, reply approval, next-issue placement, and deletion.

Test at least three failures: an unapproved submission, content placed in the wrong family workspace, and an AI edit that changes a caption's meaning. The rehearsal passes when Angela can detect and correct all three without publishing or retaining the wrong material.

### Stage 1: three-family pilot

- Three families.
- One older-adult recipient and one curator per family.
- Invited contributors chosen by each curator and accepted by the recipient.
- Four weekly issues per family, for 12 separate issues total.
- No more than four photo-caption items in any issue.
- No more than 50 accepted real photographs across the pilot.
- One operator: Angela.
- One manually selected delivery method per family.

The four-week pilot begins only after enrollment, standing preferences, contributor instructions, and the delivery method are confirmed. Issue 1 may use content collected during the setup week so all four issues can be delivered within the four pilot weeks.

### Stage 2: possible ten-family pilot

Ten families are considered only after Stage 1 meets the decision gate in Section 12. A 35-family service is a future scale scenario, not part of this MVP recommendation.

## 4. Weekly workflow

1. **Remind.** Angela sends the curator a short reminder through the family's chosen communication channel. It includes the secure submission link and deadline.
2. **Submit.** The curator and invited contributors submit photographs and captions through the web tool. They do not forward group-chat histories or grant access to conversations.
3. **Check.** Angela confirms each submission has a consent attestation, belongs to the correct family, and fits the four-item limit. The curator decides which items to defer if more than four are submitted.
4. **Edit.** Angela may edit captions directly or ask AI for text-only suggestions. She rejects invented details and confirms that the final caption preserves the contributor's meaning.
5. **Build.** Angela manually arranges up to four approved photo-caption items in that family's dedicated issue. No item from another family is visible or available in the issue builder.
6. **Approve when needed.** The first issue always requires curator approval. Later issues follow the family's standing choice: preauthorized, preview requested, or approval required. New recipients, sensitive content, uncertain consent, or major edits always trigger approval.
7. **Print.** Angela prints only the approved version, verifies the recipient name and family, and records Printed.
8. **Deliver.** Angela uses the one method selected for that family: family handoff, senior-center handoff, or local mail. She records Sent or handed off. Received is recorded only when someone voluntarily confirms it.
9. **Use freely and optionally share.** The recipient may read, keep, annotate, write privately on the issue, or decline to respond. If they share a memory, Angela records the exact wording from a handwritten card, voice capture at delivery, or one supported phone action, then confirms wording and recipients.
10. **Return.** Angela sends the approved reply to the named family recipients through the family's chosen channel. With the recipient's permission, it appears in the next issue. A final-week reply may be returned directly without promising another printed issue.
11. **Delete.** After the next issue is delivered, or after final-week closeout, Angela deletes working copies that are no longer needed. Withdrawal stops future use but cannot retrieve an already delivered printed copy.

If a deadline is missed, the issue may be late, shorter, or skipped. Missing approval is never replaced by assumption.

## 5. Simplified consent

This MVP produces private family issues, not public media.

- A contributor may submit only a photograph they own or have permission to share.
- The contributor attests that identifiable people may appear in this private issue.
- A parent or guardian provides that attestation for identifiable minors.
- The family curator approves the complete issue before printing.
- The older adult defines standing content and accessibility preferences and may request to preview any or every issue.
- The older adult approves the exact wording and named recipients of their own reply before it is shared or printed.
- Public portfolio, marketing, research, or demonstration use requires separate, direct permission. Private-pilot permission never counts as public permission.
- AI receives caption text only. Family photographs are never sent to AI in the MVP.
- Withdrawal stops future use. It cannot retrieve a delivered paper copy or a message already received by an approved recipient.

The submission form uses a required plain-language checkbox for contributor attestation. The preview has three clear actions: Approve, Request changes, and Skip this issue. Silence is not approval.

Source photos, captions, previews, final PDFs, and reply drafts are kept only as long as needed to produce the pilot and handle corrections. Default deletion is 30 days after Stage 1 ends unless the family asks Angela to delete sooner or explicitly requests an archive. AI caption text must use a provider configured not to train on the submitted text and with the shortest practical retention. If that cannot be confirmed, Angela edits without AI.

## 6. WhatsApp, WeChat, iMessage, email, and web

The web tool is the system used to build each issue. It holds the structured submission, issue draft, curator approval, print version, and minimal delivery status.

WhatsApp, WeChat, iMessage, or email are optional communication channels. Each family chooses one. Angela may use it to:

- send the weekly reminder;
- share the secure submission link;
- notify the curator that the preview is ready; and
- return the older adult's approved response to named recipients.

Family Weekly does not scrape, export, monitor, summarize, or automatically read group conversations. It does not import chat history, watch for new photographs, or infer participation from message activity. Contributors must intentionally open the secure link and submit each item.

The web tool must keep each family's workspace separate. A curator sees only their own family's submissions, preview, and status. Angela must deliberately switch families and see the family name and recipient name throughout the workflow.

## 7. AI boundaries

AI may suggest changes to explicitly submitted caption text for:

- grammar;
- shortening;
- translation drafts;
- headline suggestions; and
- section ordering.

Angela reviews every suggestion. The family curator approves the final text in the complete preview. AI output is always a draft and can be discarded without affecting the issue.

AI may not:

- receive or analyze family photographs;
- identify people or infer relationships;
- infer mood, health, cognition, loneliness, or safety;
- select which family event matters;
- invent names, dates, places, quotations, or details;
- generate the older adult's reply; or
- automatically publish, print, send, or approve anything.

AI is optional. The entire weekly workflow must work through direct human editing when AI is unavailable or declined.

## 8. Five-part web tool

The MVP web tool has five parts only:

1. **Family setup.** Angela creates one private workspace per family with recipient name, curator, invited contributors, standing preferences, chosen channel, delivery method, and issue dates.
2. **Secure submission.** Contributors open a family-specific link, add one photograph and caption at a time, complete the attestation, and submit. The tool stops accepting photographs when that issue reaches four selected items or the pilot reaches 50 accepted photographs.
3. **Issue builder.** Angela reviews submitted items, uses optional text-only AI assistance, manually selects and orders up to four items, and lays out the family-specific issue.
4. **Preview and approval.** The curator reviews the complete issue and approves, requests changes, or skips it. The tool locks an approved version and invalidates approval after any edit.
5. **Print, delivery, and reply.** Angela exports the approved print file; records Printed, Sent or handed off, and optionally Received; records the recipient's approved reply and recipients; places permitted reply text into the next family issue; and completes deletion.

There are no contributor feeds, public galleries, engagement scores, automated delivery tracking, cross-family dashboards, or older-adult accounts in Stage 1.

## 9. Accessibility requirements

The newspaper uses the recipient's chosen settings, with 16-point minimum body and caption text, 24-point or larger headings, a plain typeface, strong contrast, left alignment, short paragraphs, generous spacing, and matte paper. Text never appears over photographs, and color is never the only way meaning is conveyed.

If content does not fit, Angela removes an item or adds a page. She does not shrink text below the recipient's chosen minimum. Captions use plain language, explicit names, and dates when supplied by the contributor.

Instructions, approval choices, and reply prompts must be available in large print and readable aloud. The recipient chooses voice, handwriting, or a supported phone action. Support is offered without judgment, and no response is a valid response.

## 10. Five highest-priority risks

| Risk                                               | MVP control                                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A photograph is shared without suitable permission | Required contributor or guardian attestation; curator review; separate direct permission for any public use; immediate removal from future issues on withdrawal                     |
| Content crosses between families                   | Separate workspaces and links; family and recipient names remain visible; Angela checks the approved PDF against the delivery name before printing                                  |
| AI changes meaning or receives prohibited data     | Caption text only; no photo upload to AI; human review; curator approval; no training use; fully manual fallback                                                                    |
| The older adult loses agency or feels pressured    | Recipient sets standing preferences, may preview, may decline to reply, approves every reply and recipient, and may pause or leave without explanation                              |
| The manual workload breaks the weekly promise      | Three-family limit, four items per issue, 50-photo pilot cap, one fixed template, explicit deadlines, and permission to publish a shorter issue or skip rather than bypass approval |

Delivery problems are handled manually. The pilot records no routes, location, open tracking, behavior, or background activity.

## 11. Success criteria

Stage 1 succeeds only if the service is valued and manageable. With three families, report individual outcomes and counts, not percentages or causal claims.

- All three recipients receive the opportunity for four separate family issues; at least ten of the twelve planned issues are approved and handed off or sent.
- At least two recipients say at closeout that Family Weekly helped them feel more in touch with their family. Record their words without inferring an emotional or clinical state.
- At least two recipients complete one personally chosen meaningful phone action during the pilot, with whatever support they request, and report equal or greater confidence at closeout.
- Every shared reply has the recipient's recorded approval for its exact wording and recipients.
- No photograph is sent to AI, no issue is printed without curator approval, and no content is delivered to the wrong family.
- Angela's median hands-on production time is 45 minutes or less per issue by Week 4, excluding physical delivery time.
- At least two recipients and two curators choose to continue for another month if offered. Declining is recorded without interpretation.

## 12. Stage-2 decision gate

Consider a ten-family Stage 2 only when all Stage 1 success criteria are met and Angela can name the repeated manual steps that create most of the workload.

Before expanding, review every correction, missed issue, consent question, delivery failure, and deletion request. Automate only a stable, repetitive step that reduces Angela's work without adding work or surveillance for the older adult. Likely candidates are reminder scheduling, fixed-template layout, preview versioning, and deletion prompts. Content selection, final approval, printing, delivery choice, and replies remain human-controlled.

If connection improves but the phone action does not, revise the supported action before scaling. If the action improves but connection does not, revise the family content and response loop. If neither improves, stop. A larger pilot would only reproduce an unproven service.

The next real-world action is Stage 0: make one invented issue and walk it through the entire service, including a simulated wrong-family placement and full deletion. Do not build the application until that rehearsal confirms the five-part tool is the smallest workflow Angela actually needs.
