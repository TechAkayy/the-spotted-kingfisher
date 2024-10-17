// Google Apps Script to handle form submissions and save to a Google Sheet
const SHEET_NAME = 'Newsletter Subscribers' // Your sheet name
const MAILCHIMP_API_KEY = 'MAILCHIMP_API_KEY' // Your Mailchimp API Key
const MAILCHIMP_DATA_CENTER = MAILCHIMP_API_KEY.split('-')[1] // Extract the data center from the API key
const MAILCHIMP_LIST_ID = 'MAILCHIMP_LIST_ID' // Your Mailchimp Audience List ID

// Function to save the submitted email to the Google Sheet
async function doPost(e) {
  try {
    // const data = JSON.parse(e.postData.contents);  // Parse the POST request body
    const email = data.email // Extract the email field

    if (!email || !validateEmail(email)) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'error',
          message: 'Invalid email address.',
        })
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    sheet.appendRow([email, new Date()]) // Add the email to the sheet

    const mailchimpResponse = await addToMailchimp(email)

    if (mailchimpResponse.getResponseCode() !== 200) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'error',
          message: 'Failed to add email to Mailchimp.',
        })
      ).setMimeType(ContentService.MimeType.JSON)
    }
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Email saved successfully!',
      })
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.log(error)
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: 'An error occurred.',
      })
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function encodeBase64(input) {
  return Utilities.base64Encode(Utilities.newBlob(input).getBytes())
}

// Helper function to add email to Mailchimp list
async function addToMailchimp(email) {
  const token = encodeBase64('anystring:' + MAILCHIMP_API_KEY)

  const url = `https://${MAILCHIMP_DATA_CENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`
  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      Authorization: `Basic ${token}`, // Base64-encoded credentials
    },
    payload: JSON.stringify({
      email_address: email,
      status: 'subscribed', // Change to 'pending' if you want double opt-in
    }),
  }
  return UrlFetchApp.fetch(url, options)
}

// Email validation function
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}
