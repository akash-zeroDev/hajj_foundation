import json

log_path = "/Users/apple/.gemini/antigravity-ide/brain/e33105a5-95e6-43f9-818d-87fa0a78aff2/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
        
        content = data.get("content", "")
        if "[diff_block_start]" in content:
            print(f"Type: {data.get('type')}, Source: {data.get('source')}, Len: {len(content)}")
