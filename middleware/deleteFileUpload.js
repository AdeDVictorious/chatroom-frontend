let fs = require('fs');

/**
 * Deletes a file after a specified delay.
 * @param {string} filePath - Path to the file to be deleted.
 * @param {number} delayMs - Delay in milliseconds before deletion.
 * @param {Function} callback - Callback function to handle errors or success.
 */

function deleteFileAfterDelay(filePath, delayMs, callback) {
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        callback(err);
      } else {
        console.log('File deleted:', filePath);
        callback(null); // No error
      }
    });
  }, delayMs);
}

module.exports = deleteFileAfterDelay;
