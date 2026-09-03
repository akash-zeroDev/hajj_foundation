with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'r') as f:
    text = f.read()

text = text.replace("- `[ ]` **1. Backend: Database & Service**", "- `[x]` **1. Backend: Database & Service**")
text = text.replace("  - `[ ]` Create `Notification` Mongoose model", "  - `[x]` Create `Notification` Mongoose model")
text = text.replace("  - `[ ]` Create `NotificationService` utility", "  - `[x]` Create `NotificationService` utility")
text = text.replace("  - `[ ]` Create `notificationRoutes.js` and `notificationController.js`", "  - `[x]` Create `notificationRoutes.js` and `notificationController.js`")
text = text.replace("  - `[ ]` Mount routes in `server/server.js`", "  - `[x]` Mount routes in `server/index.js`")

text = text.replace("- `[ ]` **2. Backend: Implement Event Triggers**", "- `[/]` **2. Backend: Implement Event Triggers**")

with open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/task.md', 'w') as f:
    f.write(text)
