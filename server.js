const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
const webpush = require('web-push');
const cors = require("cors")
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/'))); 

const pool = new Pool({
  user: 'baza_jnx3_user',
  host: 'pg-cktb4j0168ec73ceo4ng-a.frankfurt-postgres.render.com',
  database: 'baza_jnx3',
  password: 'hISgqvT4fgoEAL7ZpWASewrGJtfw1mWt',
  port: 5432,
  ssl: {
    require: true, 
    rejectUnauthorized: false
  }
});
webpush.setVapidDetails(
  'mailto:your@email.com',
  'BGEgIkIqtM35J4UW-lZBhI0KrIVIbiFoBCyQog4M7g-53UPUVcwfhORKFDqUunqhPvD9V42GTHbFtCK6VnSYL84',
  'Kxbi4L6Zowcq0llEPHfKoTU_kktijMUHac2n203PWN4'
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/', 'index.html'));
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connection to the database established successfully!');
  }
  done();
});

app.post('/reminders', async (req, res) => {
  try {
    const { reminderText, reminderTime } = req.body;

    const result = await pool.query('INSERT INTO reminders(text, time) VALUES($1, $2) RETURNING *', [reminderText, reminderTime]);
    res.status(200).json({ success: true, reminder: result.rows[0] });
  } catch (error) {
    console.error('Error storing reminder:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

const subDatabse = [];


// app.post("/save-subscription", (req, res) => {
//     subDatabse.push(req.body);
//     res.json({ status: "Success", message: "Subscription saved!" })
// })

app.post('/save-subscription', (req, res) => {
  const subscription = req.body;
  pool.query('INSERT INTO subscriptions (endpoint, keys) VALUES ($1, $2)', [subscription.endpoint, JSON.stringify(subscription.keys)])
    .then(() => res.status(201).json({ success: true }))
    .catch(error => {
      console.error('Error saving subscription:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    });
});

app.get("/send-notification", async (req, res) => {
  try {
    const reminders = await pool.query('SELECT * FROM reminders WHERE time < CAST(NOW() AS time without time zone)');

    reminders.rows.forEach(async reminder => {
      const subscriptions = await pool.query('SELECT * FROM subscriptions');
      
      subscriptions.rows.forEach(subscription => {
        
        webpush.sendNotification(subscription, `Reminder: ${reminder.text}`);
      });
    });

    res.json({ "status": "Success", "message": "Message sent to push service" });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ "status": "Error", "message": "Internal Server Error" });
  }
});

async function checkReminders() {
  try {
    const reminders = await pool.query('SELECT * FROM reminders WHERE time < CAST(NOW() AS time without time zone)');

    reminders.rows.forEach(async reminder => {
      const subscriptions = await pool.query('SELECT * FROM subscriptions');
      
      subscriptions.rows.forEach(async subscription => {
        try {
          if (!isValidSubscription(subscription)) {
            console.log('Subscription is not valid:', subscription);
            return;
          }
    
          await webpush.sendNotification(subscription, `Reminder: ${reminder.text}`);
          console.log('Notification sent for reminder:', reminder.text);
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      });
    });
    

    console.log('Reminders checked at:', new Date());
  } catch (error) {
    console.error('Error checking reminders:', error);
  }


  try {
   
    pool.query('DELETE FROM reminders WHERE time < CAST(NOW() AS time without time zone)')
      .then(() => {
        console.log('Expired reminders removed at:', new Date());
      })
      .catch(error => {
        console.error('Error removing expired reminders:', error);
      });
  } catch (error) {
    console.error('Error removing expired reminders:', error);
  }

}
setInterval(checkReminders, 10000); 

function isValidSubscription(subscription) {
  return (
    subscription &&
    subscription.endpoint &&
    subscription.keys &&
    subscription.keys.auth &&
    subscription.keys.p256dh
  );
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
