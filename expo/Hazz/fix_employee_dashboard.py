with open('src/pages/Dashboards.jsx', 'r') as f:
    content = f.read()

# Fix checklist
old_checklist = """                  <div className="r">
                    <span className="k">Shariah agreement</span>
                    <span className="v">Signed</span>
                    <span className="a"><span className="pill"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>Done</span></span>
                  </div>"""

new_checklist = """                  <div className="r">
                    <span className="k">Shariah agreement</span>
                    <span className="v">{employeeData?.agreementStatus === 'signed' ? 'Signed' : 'Pending'}</span>
                    <span className="a">
                      {employeeData?.agreementStatus === 'signed' ? (
                        <span className="pill"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>Done</span>
                      ) : (
                        <span className="pill warn">Action Required</span>
                      )}
                    </span>
                  </div>"""

content = content.replace(old_checklist, new_checklist)

# Fix document link
old_doc = """                  {employeeData?.agreementUrl ? (
                    <a href={employeeData.agreementUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" onClick={() => trackDocumentActivity('VIEWED_SIGNED_CONTRACT', `Employee viewed their signed agreement`)}>"""

new_doc = """                  {employeeData?.signedDocumentId?.fileUrl && employeeData?.agreementStatus === 'signed' ? (
                    <a href={employeeData.signedDocumentId.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" onClick={() => trackDocumentActivity('VIEWED_SIGNED_CONTRACT', `Employee viewed their signed agreement`)}>"""

content = content.replace(old_doc, new_doc)

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(content)
