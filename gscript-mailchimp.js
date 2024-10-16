// Google Apps Script to handle form submissions and save to a Google Sheet
const SHEET_NAME = 'Newsletter Subscribers';  // Your sheet name

// Function to save the submitted email to the Google Sheet
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);  // Parse the POST request body
    const email = data.email;  // Extract the email field

    if (!email || !validateEmail(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid email address.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([email, new Date()]);  // Add the email to the sheet

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Email saved successfully!'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'An error occurred.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Email validation function
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
