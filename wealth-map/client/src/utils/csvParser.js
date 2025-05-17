/**
 * Utility function to parse CSV data
 */

/**
 * Parse CSV string into an array of objects
 * @param {string} csvString - The CSV string to parse
 * @param {string} delimiter - The delimiter character (default: ',')
 * @returns {Array} - Array of objects with header keys and row values
 */
export const parseCSV = (csvString, delimiter = ',') => {
  // Split the CSV string into rows
  const rows = csvString.split('\n');
  
  // Extract headers from the first row
  const headers = rows[0].split(delimiter);
  
  // Parse each data row
  return rows.slice(1).filter(row => row.trim()).map(row => {
    // Handle quoted values with commas inside
    const values = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
        inQuote = !inQuote;
      } else if (char === delimiter && !inQuote) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Push the last value
    values.push(currentValue);
    
    // Create an object with header keys and row values
    const rowObject = {};
    headers.forEach((header, index) => {
      // Clean up the header and value
      const cleanHeader = header.trim().replace(/^"|"$/g, '');
      const value = index < values.length ? values[index].trim().replace(/^"|"$/g, '') : '';
      rowObject[cleanHeader] = value;
    });
    
    return rowObject;
  });
};

/**
 * Read and parse a CSV file
 * @param {File} file - The CSV file to read
 * @returns {Promise<Array>} - Promise resolving to array of objects
 */
export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = parseCSV(event.target.result);
        resolve(csvData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Fetch and parse a CSV file from a URL or path
 * @param {string} url - The URL or path to the CSV file
 * @returns {Promise<Array>} - Promise resolving to array of objects
 */
export const fetchCSV = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error('Error fetching CSV:', error);
    throw error;
  }
};
