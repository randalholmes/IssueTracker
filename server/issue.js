//


const validIssueStatus = {
  New: true,
  Open: true,
  Assigned: true,
  Fixed: true,
  Verified: true,
  Closed: true,
};

const issueFieldTypes = {
  id: 'required',
  status: 'required',
  owner: 'required',
  effort: 'required',
  created: 'required',
  completionDate: 'not required',
  title: 'required'
};

// Check that the fields in issue match fields in issueFieldTypes and
// that required fields have values.
function validateIssue(issue) {
  for (const type in issue) {
    const value = issueFieldTypes[type];
    if (!value) {
      delete issue[type];// This type is not valid.
    } else if (value === 'required' && !issue[type]) {
      return `${type} is required.`;
    }
  }

  // Check that issue.status is a valid value
  if (!validIssueStatus[issue.status])
    return `${issue.status} is not a valid status.`;

  return null;
}

module.exports = {
  validateIssue: validateIssue
};
