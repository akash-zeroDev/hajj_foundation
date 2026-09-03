with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'r') as f:
    text = f.read()

text = text.replace("- `[/]` **4. Frontend: UI Components**", "- `[x]` **4. Frontend: UI Components**")
text = text.replace("  - `[ ]` Create `NotificationBell.jsx` with unread badge", "  - `[x]` Create `NotificationBell.jsx` with unread badge")
text = text.replace("  - `[ ]` Create `NotificationDropdown.jsx` popover", "  - `[x]` Create `NotificationDropdown.jsx` popover")
text = text.replace("  - `[ ]` Create `NotificationItem.jsx`", "  - `[x]` Create `NotificationItem.jsx`")
text = text.replace("  - `[ ]` Inject `NotificationBell` into `Navbar` and `SidebarLayout` headers", "  - `[x]` Inject `NotificationBell` into `SidebarLayout` headers")

with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'w') as f:
    f.write(text)
