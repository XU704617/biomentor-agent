---
name: transcribe
description: Transcribe audio files to text with optional diarization and speaker labeling using OpenAI Audio API. Invoke when user asks to transcribe speech, extract text from audio/video, or label speakers in recordings.
---

# Audio Transcribe

Transcribe audio using OpenAI, with optional speaker diarization when requested. Prefer the latest `gpt-4o-mini-transcribe` model for fast, accurate transcription.

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

## Quick Start

### Basic Transcription (Fast)

```python
from openai import OpenAI

client = OpenAI()

audio_file = open("path/to/audio.mp3", "rb")

transcript = client.audio.transcriptions.create(
    model="gpt-4o-mini-transcribe",
    file=audio_file,
    response_format="text",
)

print(transcript)
```

### With Speaker Diarization

```python
from openai import OpenAI

client = OpenAI()

audio_file = open("meeting.mp3", "rb")

transcript = client.audio.transcriptions.create(
    model="gpt-4o-transcribe-diarize",
    file=audio_file,
    response_format="diarized_json",
)

# transcript contains speaker labels and segments
for segment in transcript.segments:
    print(f"[{segment.speaker}] {segment.text}")
```

## Decision Rules

- Default to `gpt-4o-mini-transcribe` with `response_format: text` for fast transcription
- For speaker labels/diarization, use `gpt-4o-transcribe-diarize` with `response_format: diarized_json`
- Prompting/instructions are not supported for `gpt-4o-transcribe-diarize`
- Audio files up to ~30 seconds can be processed directly. For longer files, split into chunks

## Response Formats

| Format | Use Case |
|--------|----------|
| `text` | Simple transcription, plain text |
| `json` | Transcription with metadata, word timestamps |
| `diarized_json` | Speaker-labeled transcription |
| `verbose_json` | Full details including segments, confidence scores |
| `srt` | Subtitle format |
| `vtt` | WebVTT subtitle format |

## Supported Audio Formats

- `.mp3`, `.mp4`, `.mpeg`, `.mpga`, `.m4a`
- `.wav`
- `.webm`
- `.flac`
- `.ogg`, `.oga`

## Output Conventions

- Save transcripts under `output/transcribe/`
- Use descriptive filenames: `meeting-2024-01-15.txt`, `interview-transcript.json`

## Full Example: Meeting Transcription with Diarization

```python
from openai import OpenAI
import os

client = OpenAI()
os.makedirs("output/transcribe", exist_ok=True)

with open("meeting.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-transcribe-diarize",
        file=f,
        response_format="diarized_json",
    )

with open("output/transcribe/meeting-transcript.txt", "w") as out:
    for segment in transcript.segments:
        out.write(f"[Speaker {segment.speaker}] {segment.text}\n")

print("Transcription saved to output/transcribe/meeting-transcript.txt")
```

## Long Audio Handling

For audio longer than ~30 seconds, split and transcribe in chunks:

```python
from pydub import AudioSegment
from openai import OpenAI

client = OpenAI()
audio = AudioSegment.from_file("long_recording.mp3")
chunk_length_ms = 30000  # 30 seconds

full_transcript = []

for i, start in enumerate(range(0, len(audio), chunk_length_ms)):
    chunk = audio[start:start + chunk_length_ms]
    chunk_path = f"tmp/chunk_{i}.mp3"
    chunk.export(chunk_path, format="mp3")

    with open(chunk_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="gpt-4o-mini-transcribe",
            file=f,
            response_format="text",
        )
    full_transcript.append(transcript)

print("\n".join(full_transcript))
```

Install pydub for chunking: `pip install pydub`
