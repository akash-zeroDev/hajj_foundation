with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'r') as f:
    text = f.read()

text = text.replace("- `[/]` **3. Frontend: Context & State**", "- `[x]` **3. Frontend: Context & State**")
text = text.replace("  - `[ ]` Create `NotificationContext.jsx`", "  - `[x]` Create `NotificationContext.jsx`")
text = text.replace("  - `[ ]` Wrap `App.jsx` or relevant layouts", "  - `[x]` Wrap `main.jsx` with `NotificationProvider`")

text = text.replace("- `[ ]` **4. Frontend: UI Components**", "- `[/]` **4. Frontend: UI Components**")

with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'w') as f:
    f.write(text)
