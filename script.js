const noButton = document.querySelector('#move-random');
const feedbackMessageDisplay = document.querySelector('#feedbackMessage'); // Get the new p tag

const randomMessages = [
    "Please reconsider! 🙏",
    "Are you absolutely, positively sure? 🤔",
    "Aww, don't do this to me! 🥺",
    "My circuits will cry! 🤖💔",
    "Just one chance, maybe? ✨",
    "Pretty please with a cherry on top? 🍒",
    "Is that your final answer? No take-backsies?",
    "You're making this button work hard! 땀" //땀 is sweat drop emoji in Korean
];

if (noButton) {
    function moveButtonRandomly(elem) {
        const container = document.querySelector('.container');
        if (!container) {
            console.error('Container not found for moving button!');
            return; 
        }
        const containerRect = container.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect(); // Get button's current size

        // Max X is container width - button width. Max Y is container height - button height.
        const maxX = containerRect.width - elemRect.width;
        const maxY = containerRect.height - elemRect.height;

        // Ensure random values are not negative and within bounds
        const randomX = Math.max(0, Math.random() * maxX);
        const randomY = Math.max(0, Math.random() * maxY);

        elem.style.position = 'absolute'; // Make sure it's absolute for top/left to work
        elem.style.left = `${randomX}px`;
        elem.style.top = `${randomY}px`;

        // Display a random message
        if (feedbackMessageDisplay) {
            const randomIndex = Math.floor(Math.random() * randomMessages.length);
            feedbackMessageDisplay.textContent = randomMessages[randomIndex];
            feedbackMessageDisplay.style.display = 'block'; // Make it visible if hidden
        }
    }

    noButton.addEventListener("mouseenter", function(e) {
        moveButtonRandomly(noButton);
    });

    // Optional: Move it once on load too, so it's not in a predictable spot at first
    // This also helps if the button initially overlaps with something else.
    window.addEventListener('load', () => {
        // Small delay to ensure layout is stable
        setTimeout(() => moveButtonRandomly(noButton), 100);
    });
} else {
    // This console log helps to know if the script is loaded on a page
    // where #move-random button is not present.
    // console.log("No button with ID 'move-random' found on this page.");
}

// If feedbackMessageDisplay exists but noButton doesn't, ensure message area is clear
if (feedbackMessageDisplay && !noButton) {
    feedbackMessageDisplay.textContent = '';
    feedbackMessageDisplay.style.display = 'none';
}