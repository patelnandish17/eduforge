import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Groq client configuration
client = OpenAI(
  base_url="https://api.groq.com/openai/v1",
  api_key=os.getenv("GROQ_API_KEY"),
)

def call_llm(system_prompt: str, user_prompt: str, response_format=None, model="llama-3.3-70b-versatile", temperature=0.1):
    """
    Unified LLM caller using Groq.
    Defaults to Llama-3.3 70B for high reliability and speed.
    """
    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature
    }
    
    if response_format:
        kwargs["response_format"] = response_format

    response = client.chat.completions.create(**kwargs)
    
    content = response.choices[0].message.content
    
    # Strip markdown code blocks or conversational text
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
    if match:
        content = match.group(1)
    else:
        start = min((content.find(c) for c in '{[' if c in content), default=-1)
        if start != -1:
            end_char = '}' if content[start] == '{' else ']'
            end = content.rfind(end_char)
            if end != -1:
                content = content[start:end+1]
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return content
