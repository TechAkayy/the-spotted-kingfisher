// Google Apps Script to handle form submissions and save to a Google Sheet
const SHEET_NAME = 'Newsletter Subscribers' // Your sheet name
const MAILCHIMP_API_KEY = 'MAILCHIMP_API_KEY' // Your Mailchimp API Key
const MAILCHIMP_DATA_CENTER = MAILCHIMP_API_KEY.split('-')[1] // Extract the data center from the API key
const MAILCHIMP_LIST_ID = 'MAILCHIMP_LIST_ID' // Your Mailchimp Audience List ID

// Handles GET (preflight requests)
function doGet(e) {
  return buildResponse(200, 'Preflight OK');
}

// Handles POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents); // Parse the POST request body
    const email = data.email; // Extract the email field

    if (!email || !validateEmail(email)) {
      return buildResponse(400, 'Invalid email address.');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([email, new Date()]); // Add the email to the sheet

    try {
      if (MAILCHIMP_API_KEY !== 'MAILCHIMP_API_KEY') {
        // TODO: Ran as a side effect, move as a separate script
        addToMailchimp(email)
      }
    } catch (err) {
      console.error(err)
    }
    // TODO: Comment this line to enable Mailchimp API call
    return buildResponse(200, 'Email saved successfully!');
  } catch (error) {
    console.error('Processing Error:', error);
    return buildResponse(500, 'An error occurred.');
  }
}

// Helper function to add email to Mailchimp list
function addToMailchimp(email) {
  const token = encodeBase64('anystring:' + MAILCHIMP_API_KEY);
  const url = `https://${MAILCHIMP_DATA_CENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      Authorization: `Basic ${token}`, // Base64-encoded credentials
    },
    payload: JSON.stringify({
      email_address: email,
      status: 'subscribed', // Change to 'pending' for double opt-in
    }),
  };

  try {
    const mailchimpResponse = UrlFetchApp.fetch(url, options);
    // Log the response in Google sheet if it failed
    if (mailchimpResponse.getResponseCode() !== 200) {
      console.log('Failed to add email to Mailchimp.')
      // return buildResponse(500, 'Failed to add email to Mailchimp.');
    }
    console.log('Email saved successfully at Mailchimp!')
    // return buildResponse(200, 'Email saved successfully at Mailchimp!');
  } catch (error) {
    console.error('Mailchimp Error:', error);
    // return buildResponse(500, 'An error occurred while adding to Mailchimp.');
  }
}

// Encodes input to Base64
function encodeBase64(input) {
  return Utilities.base64Encode(Utilities.newBlob(input).getBytes());
}

// Validates email address format
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Builds a JSON response
function buildResponse(statusCode, message) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: statusCode === 200 ? 'success' : 'error', message })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Test function to simulate a POST request
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({ email: 'mybestieforlife984@gmail.com' }),
    },
  };

  doPost(mockEvent)
    .then((response) => Logger.log(response.getContent()))
    .catch((error) => Logger.log('Test failed:', error));
}