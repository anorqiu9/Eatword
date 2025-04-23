import { VocabularyApp } from './VocabularyApp.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing application');

    // Make sure the container exists
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found');
        document.body.innerHTML = `
            <div class="container">
                <h1>Error Initializing Application</h1>
                <p>Container element not found. Please check your HTML structure.</p>
                <p>Please try refreshing the page.</p>
            </div>
        `;
        return;
    }

    try {
        // Create and initialize the application
        const app = new VocabularyApp();
        await app.initialize();

        // Store the app instance on the window for debugging
        window.vocabularyApp = app;

        console.log('Vocabulary Practice application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        container.innerHTML = `
            <h1>Error Initializing Application</h1>
            <p>${error.message}</p>
            <p>Please try refreshing the page.</p>
        `;
    }
});
