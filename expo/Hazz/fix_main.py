with open('src/main.jsx', 'r') as f:
    code = f.read()

import_statement = "import { ToastProvider } from './context/ToastContext.jsx'\nimport { NotificationProvider } from './context/NotificationContext.jsx'\n"
code = code.replace("import { ToastProvider } from './context/ToastContext.jsx'", import_statement)

provider_start = """      <BrowserRouter>
        <ToastProvider>
        <App />
      </ToastProvider>
      </BrowserRouter>"""

provider_start_new = """      <BrowserRouter>
        <ToastProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ToastProvider>
      </BrowserRouter>"""

code = code.replace(provider_start, provider_start_new)

with open('src/main.jsx', 'w') as f:
    f.write(code)
