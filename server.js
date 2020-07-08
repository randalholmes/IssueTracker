//

const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

const issues = [
  {
    id: 1, status: 'open', owner: 'Raven',
    created: new Date('2016-08-15'), effort: 5, completionDate: undefined,
    title: 'Error in console when clicking Add.'
  },
  {
    id: 2, status: 'Assigned', owner: 'Eddie',
    created: new Date('2016-08-16'), effort: 14,
    completionDate: new Date('2016-08-30'),
    title: 'Missing bottom border on panel.'
  }
];

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

function validateIssue(issue) {
  // check that the fields in issue match fields in issueFieldTypes and
  // that required fields have values.
  for (const field in issue) {
    const type = issueFieldTypes[field];
    if (!type) {
      delete issue[field];
    } else if (type === 'required' && !issue[field]) {
      return `${field} is required.`;
    }
  }

  // check that issue.status is a valid value
  if (!validIssueStatus[issue.status])
    return '${issue.status} is not a valid status.';

  return null;
}


// returns all issue records
app.get('/api/issues', (req, res) => {
  db.collection('issues').find().toArray()
  .then(issues => {
    const metadata = {total_count: issues.length};
    res.json({_metadata: metadata, records:issues});
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({message: `Internal Server Error: ${error}`});
  });
});


// adds a new issue record if data is valid.
// returns the completed record for the new issue or error when
// data is invalid.
app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  newIssue.created = new Date();

  if (!newIssue.status)
    newIssue.status = 'New';

  const err = validateIssue(newIssue);
  if (err){
    res.status(422).json({message: `Invalid request: ${err}`});
    return;
  }

  db.collection('issues').insertOne(newIssue)
  .then(result => {
    db.collection('issues').find({_id: result.insertedId}).limit(1).next()
    .then(newIssue => {
      res.json(newIssue);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({message: `Internal Server Error: ${error}`});
  });
});


const client = new MongoClient('mongodb://localhost',
                  { useUnifiedTopology: true });

let db; // global database connection reference

client.connect(err => {
  if (!err) {
    console.log("Connected successfully to MongoDB server.");
    db = client.db('issuetracker');
    app.listen(3000, () => {
      console.log('App started on port 3000.');
    });
  } else {
    console.log("Database connection error:", err);
  }
});
