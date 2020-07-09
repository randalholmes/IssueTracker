/*
*    Node/Express Server for Issue Tracking System
*/

const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

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

// Returns all issue records
app.get('/api/issues', async (req,res) => {
  try {
    const issues = await db.collection('issues').find({}).toArray();
    const metadata = {total_count: issues.length};
    res.json({_metadata: metadata, records:issues});
  } catch(err) {
    console.log(error);
    res.status(500).json({message: `Internal Server Error: ${error}`});
  }
});


/*
// Returns all issue records
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
*/


// Adds a new issue record if data is valid.
// Returns the completed record for the new issue or error when
// data is invalid.
app.post('/api/issues', async (req, res) => {
  const newIssue = req.body;
  newIssue.created = new Date();

  if (!newIssue.status)
    newIssue.status = 'New';

  const err = validateIssue(newIssue);
  if (err){
    res.status(422).json({message: `Invalid request: ${err}`});
    return;
  }

  try {
    const result = await db.collection('issues').insertOne(newIssue);
    const _newIssue = await db.collection('issues')
                    .find({_id: result.insertedId}).limit(1).next();

    res.json(_newIssue);

  } catch(error) {
    console.log(error);
    res.status(500).json({message: `Internal Server Error: ${error}`});
  }
});




/*
// Adds a new issue record if data is valid.
// Returns the completed record for the new issue or error when
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
*/


/****  Connect to Database Server and Network Socket ****/
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
