# Eatword - Vocabulary Practice Application

A web application for practicing English vocabulary with multiple learning modes.

## Features

- Multiple vocabulary levels (C, D, E, F, G, H, I, J)
- Three practice modes:
  - **Review Mode**: See the word, syllables, pronunciation, and meaning
  - **Dictation Mode**: See the pronunciation, type the word
  - **Listening Mode**: Hear the word, type what you hear
- Unit selection for each level
- Word shuffling
- Word scrambling (in Review mode)
- Text-to-speech functionality

## Project Structure

The application has been refactored to use Object-Oriented Programming (OOP) principles:

```
eatword/
├── index.html
├── styles.css
├── js/
│   ├── main.js                 # Application entry point
│   ├── VocabularyApp.js        # Main application class
│   ├── models/
│   │   ├── Word.js             # Word model
│   │   ├── Unit.js             # Unit model
│   │   └── Level.js            # Level model
│   └── managers/
│       ├── DataManager.js      # Manages loading and storing vocabulary data
│       ├── SpeechManager.js    # Manages text-to-speech functionality
│       ├── WordManager.js      # Manages word selection and tracking progress
│       ├── ModeManager.js      # Manages practice modes
│       └── UIManager.js        # Manages the user interface
├── words/
│   └── HF/                     # Vocabulary data
│       ├── levelC.json
│       ├── levelD.json
│       ├── levelE.json
│       ├── levelF.json
│       ├── levelG.json
│       ├── levelH.json
│       ├── levelI.json
│       └── levelJ.json

```

## Class Responsibilities

- **VocabularyApp**: Main application class that coordinates all managers
- **Word**: Represents a vocabulary word with its properties
- **Unit**: Represents a unit of vocabulary words
- **Level**: Represents a vocabulary level containing multiple units
- **DataManager**: Handles loading and storing vocabulary data
- **SpeechManager**: Manages text-to-speech functionality
- **WordManager**: Manages word selection, shuffling, and tracking progress
- **ModeManager**: Manages practice modes (review, dictation, listening)
- **UIManager**: Manages the user interface

## Running the Application

Simply open `index.html` in a web browser.

## Future Improvements

- Add more vocabulary levels
- Implement user accounts to track progress
- Add more practice modes
- Improve mobile responsiveness