/**
 * Generate assistanttrain.txt from train.json
 * This script converts the JSON Q&A data into a text format for mobile app
 */

const fs = require('fs');
const path = require('path');

const TRAIN_JSON_PATH = path.join(__dirname, '../train.json');
const OUTPUT_TXT_PATH = path.join(__dirname, '../assets/assistanttrain.txt');

function generateTrainingText() {
  try {
    console.log('📖 Reading train.json...');
    
    // Read train.json
    if (!fs.existsSync(TRAIN_JSON_PATH)) {
      console.error('❌ train.json not found at:', TRAIN_JSON_PATH);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(TRAIN_JSON_PATH, 'utf8'));
    
    if (!data.faqs || !Array.isArray(data.faqs)) {
      console.error('❌ Invalid train.json format - missing faqs array');
      process.exit(1);
    }

    console.log(`✅ Found ${data.faqs.length} Q&A pairs`);

    // Generate text content
    let textContent = '';
    
    data.faqs.forEach((faq, index) => {
      if (faq.question && faq.answer) {
        // Format: numbered entry with Q: and A: prefixes
        textContent += `${index + 1}. ${faq.question}\n${faq.answer}\n\n`;
      }
    });

    // Ensure assets directory exists
    const assetsDir = path.dirname(OUTPUT_TXT_PATH);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      console.log('📁 Created assets directory');
    }

    // Write to file
    fs.writeFileSync(OUTPUT_TXT_PATH, textContent.trim(), 'utf8');
    
    console.log('✅ Successfully generated assistanttrain.txt');
    console.log(`📍 Output location: ${OUTPUT_TXT_PATH}`);
    console.log(`📊 Total entries: ${data.faqs.length}`);
    console.log(`📏 File size: ${(textContent.length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error generating training text:', error);
    process.exit(1);
  }
}

// Run the script
generateTrainingText();
