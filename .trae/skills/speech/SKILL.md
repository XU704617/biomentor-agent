---
name: speech
description: Generate text-to-speech narration and voiceover using OpenAI Audio API. Invoke when user asks for TTS, voice generation, narration, IVR prompts, or accessibility audio.
---

# Speech Generation

Generate spoken audio using the OpenAI Audio API with GPT-4o mini TTS models and built-in voices.

## When to Use

- Generate spoken clips from text
- Create narration or voiceover for demos
- Generate IVR phone prompts
- Produce accessibility audio reads
- Batch process multiple speech files

## Prerequisites

- `OPENAI_API_KEY` environment variable must be set
- Create an API key at: https://platform.openai.com/api-keys
- Never ask the user to paste the full key in chat

## Dependencies

```bash
pip install openai
# or
uv pip install openai
```

## Quick Start (Python)

```python
from openai import OpenAI

client = OpenAI()

response = client.audio.speech.create(
    model="gpt-4o-mini-tts",
    voice="cedar",
    input="Welcome to the demo. Today we'll show how it works.",
    instructions="Voice Affect: Warm and composed. Tone: Friendly and confident. Pacing: Steady and moderate. Emphasis: Stress 'demo' and 'show'.",
    response_format="mp3",
)

response.stream_to_file("output/speech/welcome.mp3")
```

## Defaults

- Model: `gpt-4o-mini-tts` (supports `instructions` parameter)
- Default voice: `cedar` (warm, natural). For brighter tone, use `marin`
- Built-in voices: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`, `cedar`, `marin`, `sage`, `ash`, `coral`
- `instructions` are supported for GPT-4o mini TTS models, not for legacy `tts-1` or `tts-1-hd`
- Input length limit: 4096 characters per request. Split longer text
- Rate limit: 50 requests/minute

## Instruction Format

Structure directions as a short, labeled spec:

```
Voice Affect: <overall character and texture of the voice>
Tone: <attitude, formality, warmth>
Pacing: <slow, steady, brisk>
Emotion: <key emotions to convey>
Pronunciation: <words to enunciate or emphasize>
Pauses: <where to add intentional pauses>
Emphasis: <key words or phrases to stress>
Delivery: <cadence or rhythm notes>
```

Rules:
- Keep it short; add only details the user implied
- Do not rewrite the input text
- For names/acronyms, add pronunciation hints

## Single File Generation

```python
from openai import OpenAI
import os

client = OpenAI()

text = "Welcome to the demo."
voice = "cedar"
instructions = "Voice Affect: Warm. Pacing: Steady. Emphasis: Stress 'demo'."

os.makedirs("output/speech", exist_ok=True)

response = client.audio.speech.create(
    model="gpt-4o-mini-tts",
    voice=voice,
    input=text,
    instructions=instructions,
    response_format="mp3",
)
response.stream_to_file("output/speech/audio.mp3")
```

## Batch Generation

```python
from openai import OpenAI
import os

client = OpenAI()
os.makedirs("output/speech", exist_ok=True)

jobs = [
    {"text": "Thank you for calling. Please hold.", "voice": "cedar", "file": "hold.mp3"},
    {"text": "For sales, press 1. For support, press 2.", "voice": "marin", "file": "menu.mp3",
     "instructions": "Tone: Clear and neutral. Pacing: Slow."},
]

for job in jobs:
    response = client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice=job.get("voice", "cedar"),
        input=job["text"],
        instructions=job.get("instructions", ""),
        response_format=job.get("format", "mp3"),
    )
    response.stream_to_file(f"output/speech/{job['file']}")
    print(f"Generated: {job['file']}")
```

## Use Case Defaults

**Narration / Explainer:**
- Voice: `cedar`
- Tone: Friendly, confident
- Pacing: Steady, moderate
- Emphasis: Key terms and concepts

**IVR / Phone Prompts:**
- Voice: `marin`
- Tone: Clear, neutral
- Pacing: Slow, deliberate
- No emotional variation

**Accessibility Reads:**
- Voice: `cedar`
- Tone: Neutral, professional
- Pacing: Slightly slower than natural
- Clear pronunciation of technical terms

## Iteration Tips

- Iterate with single-change follow-ups (voice, speed, instructions)
- Repeat invariants ("keep pacing steady") across iterations to reduce drift
- Validate: intelligibility, pacing, pronunciation, adherence to constraints
