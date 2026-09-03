with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# Make it slightly larger
code = code.replace('max-w-[360px]', 'max-w-[400px]')
code = code.replace('p-5 flex items-start gap-3', 'p-6 flex items-start gap-4')
code = code.replace('h-8 w-8 shrink-0', 'h-10 w-10 shrink-0')
code = code.replace('h-4 w-4', 'h-5 w-5')
code = code.replace('flex-1 mt-[3px]', 'flex-1 mt-[2px]')
code = code.replace('text-[14px] font-bold text-slate-900', 'text-[15px] font-bold text-slate-900')
code = code.replace('text-[12.5px] text-slate-500 mt-2', 'text-[13.5px] text-slate-500 mt-1.5')

# Make footer slightly larger
code = code.replace('bg-slate-50 border-t border-slate-100 p-3 flex justify-end gap-2', 'bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3')
code = code.replace('px-3.5 py-1.5 rounded-md border border-slate-200 text-[12px]', 'px-4 py-2 rounded-lg border border-slate-200 text-[13px]')
code = code.replace('px-3.5 py-1.5 rounded-md bg-red-600 text-white text-[12px]', 'px-4 py-2 rounded-lg bg-red-600 text-white text-[13px]')
code = code.replace('px-3.5 py-1.5 rounded-md bg-amber-600 text-white text-[12px]', 'px-4 py-2 rounded-lg bg-amber-600 text-white text-[13px]')
code = code.replace('w-3.5 h-3.5 border-2', 'w-4 h-4 border-2')

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
