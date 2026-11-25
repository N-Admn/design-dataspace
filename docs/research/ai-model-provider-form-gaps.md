# AI Model provider form: live vs prototype

A comparison of the live AI Model provider form (Parakh / CivicDataSpace) with the provider form in this prototype
(`src/components/ai-model/AIModelStep1Details.tsx`, `src/components/ai-model/AIModelVersionsStep.tsx`, `src/types/ai-model.ts`).
Recorded 23 Nov 2026, while designing the AI Model detail page (`/playground/ai-model-detail`).

## Summary

- The prototype covers almost every live field. The access method form matches field for field.
- Two public fields are **missing** in the prototype: **Maximum Tokens** and **Access Type (Open / Restricted)**.
- Several fields use **different options** from live: Model Type, Target Users, Languages, Geography, Usage License and
  Lifecycle Stage.
- The licence list is the dataset one, so software licences such as Apache 2.0 or MIT can't be chosen.

## Step 1: Metadata

| Field on live | Live | Prototype | Gap |
|---|---|---|---|
| Model Type | Required. Options include "Text Generation" | Required. Large Language Model, Classification, Regression, Computer Vision, NLP, Forecasting, Recommendation System, Speech Recognition, Other | Option list differs |
| Domain | Optional. Includes "General" | Required. Includes "General Purpose" | Required-ness and wording differ |
| Description | Rich text, 1000-character limit | Present | None noted |
| Target Users | Required, free text | Optional, multi-select of 6 options (Researchers, Developers, Analysts, Government Teams, Organisations, General Users) | Input type differs |
| Intended Use | Required, free text | Optional, free text | Required-ness differs |
| Sectors | Required, multi-select | Required, multi-select | None |
| Tags | Required | Optional | Required-ness differs |
| **Maximum Tokens** | Required, select (e.g. 65536) | — | **Missing** |
| Languages | Required, one multi-select | Two steps: Language Support (Multilingual / Specific / Not language-dependent), then Supported Languages when Specific | Structure differs |
| Model Website | Required | Optional | Required-ness differs |
| Locations / Geography | Required. Regions, e.g. "Asia Pacific" | Optional. India, Bangladesh, Nepal, Sri Lanka, Pakistan, Bhutan, Global | Option list differs |
| Usage License | Optional. Software licences, e.g. Apache 2.0 | Required. Reuses the dataset licence list (CC BY 4.0, CC BY-SA 4.0, CC0, ODC-By, Govt OGD India, Other) | **No software licences** |
| **Select Access Type** | Required. Open Access ("Model can be viewed and used by everyone") or Restricted Access ("Users would require to request access to the model") | — | **Missing** |
| Model Name | Not shown in the screenshot of this step | Required | Check where live collects it |

## Step 2: Version

| Field on live | Prototype | Gap |
|---|---|---|
| Version selector, New Version | Version list with Add Version | Layout only |
| Lifecycle Stage (required). Includes "Production" | Development, Beta, Stable, Deprecated | Option list differs |
| Select as Primary Version | Set as Primary Version | None |
| Access methods table: Provider, Endpoint URL, Access Priority (Primary / Alternate Source), Actions | Access method list with a Primary badge, edit and remove | Layout only |

## Add Access Method

| Field on live | Prototype | Gap |
|---|---|---|
| Provider Type | Provider (OpenAI, Ollama, Together AI, Replicate, Custom API) | None |
| Provider Model ID (optional for Custom API) | Required for every provider | Required-ness differs |
| API Endpoint URL (required) | Endpoint URL (Ollama and Custom API) | None |
| API Key / Token | Separate API key for OpenAI / Together AI / Replicate; for Custom API the key is entered under Authentication Type | Structure differs for Custom API |
| Authentication Type | No Authentication, Bearer Token, API Key, Custom Header | None |
| Auth Header Name | Header name | None |
| — | "Send key in" (header or query), for API Key auth | Extra in prototype |
| Request Body Template | Request Body Template | None |
| Response Path | Response Path | None |
| Timeout (seconds) | Timeout (seconds) | None |
| Set as Primary Provider | Set as Primary access method | None |
| — | Name | Extra in prototype |

## Effect on the AI Model detail page

- The detail page shows only public provider fields. Access methods (provider, model ID, endpoint, keys, request settings)
  are never shown, so differences in the access method form don't affect it.
- **Maximum Tokens** and **Access Type** are public and belong on the page, but can't be shown until the prototype
  collects them.
- **Licence:** a model licensed under Apache 2.0 or MIT can't be represented yet.
- Past evaluations, as shown on Parakh, are not provider form fields and are not on the page.

## Suggested next steps

1. Add Maximum Tokens and Access Type to `AIModelMetadata`, the Metadata step and the detail page.
2. Add software licences (Apache 2.0, MIT and others) to the AI Model licence options, separate from the dataset list.
3. Align the Model Type, Target Users, Languages, Geography and Lifecycle Stage options and required fields with live.
