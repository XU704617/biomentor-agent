---
name: jupyter-notebook
description: Create, scaffold, and edit Jupyter notebooks (.ipynb) for experiments, tutorials, and data analysis. Invoke when user asks to create a notebook, convert scripts to notebooks, or structure exploratory analysis.
---

# Jupyter Notebook Skill

Create clean, reproducible Jupyter notebooks for two primary modes:
- Experiments and exploratory analysis
- Tutorials and teaching-oriented walkthroughs

## When to Use

- Create a new `.ipynb` notebook from scratch
- Convert rough notes or scripts into a structured notebook
- Refactor an existing notebook to be more reproducible and skimmable
- Build experiments or tutorials that will be read or re-run by others

## Decision Tree

- If the request is exploratory, analytical, or hypothesis-driven, choose `experiment`
- If the request is instructional, step-by-step, or audience-specific, choose `tutorial`
- If editing an existing notebook, treat it as a refactor: preserve intent and improve structure

## Workflow

### 1. Lock the Intent

Identify the notebook kind: `experiment` or `tutorial`.
Capture the objective, audience, and what "done" looks like.

### 2. Scaffold the Notebook

For experiments, structure:

```json
{
  "cells": [
    {"cell_type": "markdown", "source": ["# Experiment Title\n\nObjective: ..."]},
    {"cell_type": "code", "source": ["# Setup\nimport pandas as pd\nimport matplotlib.pyplot as plt"]},
    {"cell_type": "markdown", "source": ["## Step 1: Data Loading"]},
    {"cell_type": "code", "source": ["df = pd.read_csv('data.csv')\ndf.head()"]},
    {"cell_type": "markdown", "source": ["## Conclusion\n\nKey findings: ..."]}
  ]
}
```

For tutorials, structure:

```json
{
  "cells": [
    {"cell_type": "markdown", "source": ["# Tutorial Title\n\nLearning objectives:\n- Objective 1\n- Objective 2"]},
    {"cell_type": "markdown", "source": ["## Prerequisites\n\n- Python 3.9+\n- Required packages: ..."]},
    {"cell_type": "markdown", "source": ["## Section 1: Concept\n\nExplanation of the concept."]},
    {"cell_type": "code", "source": ["# Example code with explanations"]},
    {"cell_type": "markdown", "source": ["## Exercises\n\nTry it yourself: ..."]}
  ]
}
```

### 3. Fill with Runnable Steps

- Keep each code cell focused on one step
- Add short markdown cells explaining purpose and expected result
- Avoid large, noisy outputs when a short summary works

### 4. Follow the Right Pattern

**For experiments:**
- Start with a clear hypothesis or question
- Load and inspect data first
- Document each transformation step
- Visualize key findings
- End with conclusions and next steps

**For tutorials:**
- State learning objectives upfront
- List prerequisites clearly
- Build concepts incrementally
- Show code with explanations
- Include exercises for practice
- Provide reference links

### 5. Edit Safely on Existing Notebooks

- Preserve notebook structure; avoid reordering cells unless it improves the story
- Prefer targeted edits over full rewrites
- Notebook JSON must maintain valid structure: `nbformat`, `nbformat_minor`, `metadata`, `cells`

### 6. Validate

- Run the notebook top-to-bottom when the environment allows
- If execution is not possible, say so explicitly
- Verify all imports resolve and all cells produce expected output

## Dependencies

```bash
pip install jupyterlab ipykernel
# Or
uv pip install jupyterlab ipykernel
```

## Notebook JSON Structure

A valid .ipynb file has this basic shape:

```json
{
  "nbformat": 4,
  "nbformat_minor": 5,
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "name": "python",
      "version": "3.9.0"
    }
  },
  "cells": []
}
```

Each cell has:
- `cell_type`: "markdown", "code", or "raw"
- `metadata`: empty object or specific metadata
- `source`: array of strings (one per line) or single string
- `outputs`: (code cells only) array of output objects
