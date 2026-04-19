const fs = require('fs');
const path = require('path'); // Always use this for paths

// 1. Create an absolute path to the emoji folder
// This says: "Start where this script is, then look for a folder named emoji"
const emojiFolder = path.join(__dirname, '../../emoji');
const outputFile = path.join(__dirname, 'emoji-list.json');

try {
    // 2. Read the directory using the absolute path
    const files = fs.readdirSync(emojiFolder);

    // 3. Filter out non-images (like .DS_Store or hidden files)
    const images = files.filter(file => 
        file.endsWith('.gif')
    );

    // 4. Save the list
    fs.writeFileSync(outputFile, JSON.stringify(images, null, 2));
    
    console.log(`✅ Success! Found ${images.length} emojis and updated emoji-list.json`);
} catch (err) {
    console.error("❌ Error reading the folder:", err.message);
    console.log("Looking in:", emojiFolder);
}