# ParakhAI client feedback vs the new CivicDataSpace

Client testing of ParakhAI before its completion certificate. Most of it was done on the **old** CivicDataSpace site, where
models and prompt libraries are added before they are evaluated in ParakhAI (https://parakh.civicdataspace.in/).

This note maps each feedback point to the **new** CivicDataSpace prototype in this repo: what is already addressed and what
is still missing. Reviewed 25 Nov 2026 against the `iteration` branch plus the AI model detail page. ParakhAI itself was not
reviewed. Points 4 and 5 happen there.

## What the clients reported

1. **Adding models was hard.** Even with a step-by-step document with screenshots, they struggled to fill in all the
   required details and asked whether so many were needed.
2. **The API key failed silently.** A 35-character key had a stray space after the 32nd character. CivicDataSpace showed no
   error. The evaluation then failed in ParakhAI with "No successful AuditTest objects found for this audit (all may have
   failed inference)", which doesn't say whether the key, the configuration or the model was at fault.
3. **Model details looked lost, and a button was hidden.** On returning to a model, only the first tab was filled in; the
   Version tab was empty, so they re-entered it. In the model configuration dialog, the Update button was hidden at default
   scaling until they zoomed the browser to 90%.
4. **Empty responses were counted as passes.** Some Sarvam model responses were empty, yet ParakhAI reported "No Issues
   Found" for those test cases.
5. **The metrics were hard to read.** For example, what "High Risk: 2" or "Total Pass Rate 82.86%" means, and how to judge
   the model from them.
6. **Creating prompt libraries was hard.** The steps weren't clear.
7. **The two platforms were confusing.** Models and prompt libraries are added in CivicDataSpace and evaluated in ParakhAI.
   Clients saw this as one task, and weren't sure where each step happens or how the two connect.
8. **Account creation failed.** This was a known Keycloak issue. Accounts were created manually for the session. It is fixed
   and waiting to be deployed.

The overall finding: a first-time user should be able to configure a model, create a prompt library, run an evaluation and
read the results without outside help.

## Status in the new app

| # | Feedback | Addressed in the new app | Still missing |
|---|---|---|---|
| 1 | Adding models was hard; too many details asked | **Partly.**<br>• The form is three steps: Versions → Model Information → Review & Publish.<br>• Fewer fields are required than on the old site: target users, intended use, tags, geography and website are optional.<br>• Sectors, target users and tags are suggested from the description.<br>• A default licence (CC BY 4.0) is one click.<br>• Review & Publish lists what's still missing. | • No in-form help explaining why each field is asked for, or an example per field.<br>• Nothing that would replace the step-by-step document clients needed. |
| 2 | API key with a stray space failed silently; unclear error | **Partly.**<br>• The version drawer has **Test Access Methods**: it runs a sample prompt and shows a plain-language result (Authentication Failed, Connection Failed, Invalid Request, Request Timed Out, Response Extraction Failed) with each step it went through.<br>• **The test is simulated:** the prototype has no backend that can call a provider. | • An API key containing spaces isn't caught or trimmed; only an empty key is flagged.<br>• A real connection test needs the backend.<br>• ParakhAI's failure message needs rewording (see 4). |
| 3a | Version tab empty when revisiting a model | **Yes, in the prototype.** Reopening a model loads everything saved, versions and access methods included. Draft edits are kept for the preview. | Confirm once it is connected to the real backend. |
| 3b | Update button hidden at default zoom | **Yes.** The version form is a right-hand drawer: the fields scroll and Cancel / Save Version stay pinned at the bottom. PR #124 added a fluid interface scale. | Check the drawer at laptop sizes and 100% zoom. |
| 4 | Empty model responses shown as "No Issues Found" | **No.** This is ParakhAI's evaluation. | Treat an empty response as its own outcome (for example "No response"), never as a pass. |
| 5 | Hard to understand the metrics | **No.** This is ParakhAI's results page. | Plain-language definitions and context for each metric, e.g. "2 of 35 test prompts produced high-risk answers". |
| 6 | Creating prompt libraries was hard | **Partly.**<br>• Prompt libraries are a dataset type, chosen under "Add New Dataset".<br>• Each prompt file has a details panel: format, whether it has a system prompt or example responses, and a description per column. | • No explanation of what a prompt library is or how ParakhAI uses it.<br>• No template or sample file to start from. |
| 7 | Confusion between CivicDataSpace and ParakhAI | **Slightly.** An organisation can give someone the **Evaluator** role and choose which published models and datasets they review through ParakhAI. | • Nothing in the interface explains the journey: add the model and prompt library in CivicDataSpace, then evaluate in ParakhAI.<br>• No links between the two, such as "Evaluate in ParakhAI" from a model or "Add a model" from ParakhAI. |
| 8 | Couldn't create accounts (Keycloak) | **Fixed, waiting to be deployed.** The prototype's sign-up, sign-in and forgot-password pages are front-end only, so they don't test the fix. | Deploy the fix. |

## Summary

**Covered:** the form mechanics. Version data is no longer lost, the Save button no longer hides, and fewer fields are
required. There is the start of clearer API-key errors.

**Still missing:**

- **Guidance in CivicDataSpace:** help for each model field, an explanation of prompt libraries with a starter template, and
  the CivicDataSpace → ParakhAI journey shown in the interface.
- **Validation:** catch spaces in API keys, and make the access method test real once a backend can call providers.
- **ParakhAI:** report empty responses as their own outcome, and explain each metric in plain language.

## Related

- [ai-model-provider-form-gaps.md](ai-model-provider-form-gaps.md): live provider form vs prototype, field by field.
