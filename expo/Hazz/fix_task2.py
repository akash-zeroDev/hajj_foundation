with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'r') as f:
    text = f.read()

text = text.replace("- `[/]` **2. Backend: Implement Event Triggers**", "- `[x]` **2. Backend: Implement Event Triggers**")
text = text.replace("  - `[ ]` **Employee → Admin**", "  - `[x]` **Employee → Admin**")
text = text.replace("    - `[ ]` Trigger on onboarding complete", "    - `[x]` Trigger on onboarding complete")
text = text.replace("    - `[ ]` Trigger on subscription activated", "    - `[x]` Trigger on subscription activated")
text = text.replace("    - `[ ]` Trigger on profile update", "    - `[x]` Trigger on profile update")
text = text.replace("    - `[ ]` Trigger on auto-pay cancellation", "    - `[x]` Trigger on auto-pay cancellation")
text = text.replace("  - `[ ]` **Admin → Super Admin**", "  - `[x]` **Admin → Super Admin**")
text = text.replace("    - `[ ]` Trigger on annual fee paid", "    - `[x]` Trigger on annual fee paid")
text = text.replace("    - `[ ]` Trigger on org details updated", "    - `[x]` Trigger on org details updated")

text = text.replace("- `[ ]` **3. Frontend: Context & State**", "- `[/]` **3. Frontend: Context & State**")

with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'w') as f:
    f.write(text)
