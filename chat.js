document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');

    // --- Data & State ---
    let currentStep = 0;
    const userData = {
        name: '', // We can ask for this if you want
        interests: []
    };

    const dateIdeasDB = { // Same as before, or expand it!
        adventure: [
            { name: "Scenic Hike", description: "Explore a beautiful trail and enjoy nature." },
            { name: "Kayaking/Paddleboarding", description: "Get on the water for some fun." },
            { name: "Rock Climbing (Indoor)", description: "Challenge yourselves with a climb."}
        ],
        foodie: [
            { name: "Cooking Class", description: "Learn to make a new dish together." },
            { name: "Food Market Tour & Tasting", description: "Discover local delicacies." },
            { name: "Unique Themed Restaurant", description: "Try an eatery with a cool concept." }
        ],
        artsy: [
            { name: "Museum or Art Gallery Visit", description: "Appreciate some art and culture." },
            { name: "Live Music Gig (Indie Band)", description: "Discover new music together." },
            { name: "DIY Craft Workshop", description: "Make something cool, like pottery or jewelry."}
        ],
        chill: [
            { name: "Picnic by the Lake/River", description: "Relax with good food and serene views." },
            { name: "Board Game Cafe", description: "Challenge each other with fun board games." },
            { name: "Stargazing Night", description: "Find a dark spot and look up at the stars (weather permitting!)."}
        ],
        active: [
            { name: "Trampoline Park", description: "Jump around and feel like kids again." },
            { name: "Ice Skating or Rollerblading", description: "Glide around and have a laugh." },
            { name: "Attend a local Sports Game", description: "Cheer for a local team." }
        ],
        generic: [
            { name: "Explore a New Neighborhood", description: "Wander around and discover hidden gems." },
            { name: "Visit an Arcade", description: "Play some retro and new games." },
            { name: "Sunset Watching from a Viewpoint", description: "Enjoy a beautiful sunset together."}
        ]
    };

    // --- Conversation Flow ---
    // We'll define steps. Each step can have a bot question,
    // how to process user's answer, and what to do next.
    const conversationFlow = [
        { // Step 0: Initial Greeting & Ask about general vibe
            botQuestion: "Hey! So excited to plan this! 😊 To start, what kind of vibe are you in the mood for? Something adventurous, super chill, or maybe foodie-focused?",
            processAnswer: (answer) => {
                // Simple keyword matching for this first question
                answer = answer.toLowerCase();
                if (answer.includes("adventur")) userData.interests.push("adventure");
                if (answer.includes("chill") || answer.includes("relax")) userData.interests.push("chill");
                if (answer.includes("food") || answer.includes("drink")) userData.interests.push("foodie");
                if (answer.includes("art") || answer.includes("cultur")) userData.interests.push("artsy");
                if (answer.includes("active") || answer.includes("sport")) userData.interests.push("active");
                // Even if no specific keywords, we move to the next step.
                // More sophisticated parsing could be done here.
            },
            nextStep: 1
        },
        { // Step 1: Offer more specific interest buttons (or ask another open question)
            botQuestion: "Got it! Anything else specific you love doing or have been wanting to try? Or I can give you some quick options to pick from!",
            showOptions: true, // Custom flag to indicate we should show buttons
            options: [
                { text: "Adventure!", value: "adventure" },
                { text: "Foodie Fun!", value: "foodie" },
                { text: "Artsy Vibes!", value: "artsy" },
                { text: "Just Chill", value: "chill" },
                { text: "Let's Get Active!", value: "active" },
                { text: "Surprise Me!", value: "generic" }
            ],
            processAnswer: (answer, isOptionClick = false) => {
                if (isOptionClick) {
                    if (!userData.interests.includes(answer)) { // Avoid duplicates if already picked
                        userData.interests.push(answer);
                    }
                } else { // If they typed something instead of clicking
                    answer = answer.toLowerCase();
                    // You can add more keyword checks here if they type
                    if (answer.includes("adventur") && !userData.interests.includes("adventure")) userData.interests.push("adventure");
                    if ((answer.includes("chill") || answer.includes("relax")) && !userData.interests.includes("chill")) userData.interests.push("chill");
                    // ... etc. for other keywords
                }
            },
            nextStep: 2
        },
        { // Step 2: Generate and show suggestions
            botQuestion: "Okay, based on that, here are a couple of ideas! Let me know what you think, or if you want more options!",
            generateSuggestions: true, // Custom flag
            nextStep: null // End of automated suggestion flow for now
        }
    ];

    // --- Functions ---
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
    }

    function displayBotMessageWithOptions(stepConfig) {
        addMessage(stepConfig.botQuestion, 'bot');

        if (stepConfig.showOptions && stepConfig.options) {
            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('suggestion-buttons', 'bot-message'); // Style as bot message too

            stepConfig.options.forEach(opt => {
                const button = document.createElement('button');
                button.textContent = opt.text;
                button.onclick = () => {
                    // Simulate user input with the option's value
                    addMessage(opt.text, 'user'); // Show what they clicked
                    userInput.value = ''; // Clear input field
                    hideOptions(); // Remove buttons after click

                    // Process this "answer"
                    if (conversationFlow[currentStep] && conversationFlow[currentStep].processAnswer) {
                        conversationFlow[currentStep].processAnswer(opt.value, true); // Pass true for isOptionClick
                    }
                    proceedToNextStep();
                };
                optionsContainer.appendChild(button);
            });
            chatMessages.appendChild(optionsContainer);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function hideOptions() {
        const existingOptions = chatMessages.querySelector('.suggestion-buttons');
        if (existingOptions) {
            existingOptions.remove();
        }
    }


    function generateAndShowSuggestions() {
        let suggestionsHTML = "";
        let ideasFound = 0;

        // Use a Set to ensure unique ideas if multiple interests match same idea category
        const suggestedIdeaNames = new Set();
        const finalIdeas = [];


        if (userData.interests.length > 0) {
            userData.interests.forEach(interest => {
                if (dateIdeasDB[interest]) {
                    // Pick one or two random ideas from this category that haven't been picked
                    let ideasFromCategory = dateIdeasDB[interest].filter(idea => !suggestedIdeaNames.has(idea.name));
                    if (ideasFromCategory.length > 0) {
                        const randomIndex = Math.floor(Math.random() * ideasFromCategory.length);
                        const idea = ideasFromCategory[randomIndex];
                        finalIdeas.push(idea);
                        suggestedIdeaNames.add(idea.name);
                        ideasFound++;
                    }
                }
            });
        }

        // If not enough ideas from specific interests, add generic ones
        let ideasNeeded = 2 - ideasFound; // Aim for at least 2 ideas
        if (ideasNeeded > 0 && dateIdeasDB.generic) {
             let genericIdeasAvailable = dateIdeasDB.generic.filter(idea => !suggestedIdeaNames.has(idea.name));
             for (let i = 0; i < ideasNeeded && genericIdeasAvailable.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * genericIdeasAvailable.length);
                const idea = genericIdeasAvailable.splice(randomIndex, 1)[0]; // remove to avoid re-picking
                finalIdeas.push(idea);
                suggestedIdeaNames.add(idea.name);
                ideasFound++;
            }
        }
        
        if (finalIdeas.length > 0) {
            finalIdeas.forEach(idea => {
                 suggestionsHTML += `<div class="final-suggestion"><strong>${idea.name}:</strong> ${idea.description}</div>`;
            });
        } else {
            suggestionsHTML = `<div class="final-suggestion">Hmm, how about we just grab a coffee or tea and chat some more to figure out the perfect plan? 😊</div>`;
        }
        
        // Add as a bot message block
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.classList.add('message', 'bot-message'); // Style as a bot message
        suggestionsDiv.innerHTML = suggestionsHTML; // Use innerHTML because we have HTML structure
        chatMessages.appendChild(suggestionsDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add a final encouraging message
        setTimeout(() => {
            addMessage("What do you think of these? Or want to brainstorm more? 😄", 'bot');
        }, 800);
    }


    function handleUserInput() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        userInput.value = ''; // Clear input field
        hideOptions(); // If user types instead of clicking option, hide options

        const currentConversationStep = conversationFlow[currentStep];
        if (currentConversationStep) {
            if (currentConversationStep.processAnswer) {
                currentConversationStep.processAnswer(messageText, false); // false for isOptionClick
            }
            proceedToNextStep();
        } else {
            // Default response if conversation flow ends or no specific handler
            addMessage("That's interesting! Let me think... 🤔", 'bot');
            // You could add more open-ended responses here or loop back
        }
    }

    function proceedToNextStep() {
        if (conversationFlow[currentStep] && conversationFlow[currentStep].nextStep !== null) {
            currentStep = conversationFlow[currentStep].nextStep;
            triggerBotResponse();
        } else if (conversationFlow[currentStep] && conversationFlow[currentStep].generateSuggestions) {
            // This was the step to generate suggestions, so currentStep won't advance via nextStep
            // but the action is done. Now the bot can just listen or offer more.
            // (Handled within generateAndShowSuggestions's final message)
        } else {
            // End of defined flow
            console.log("End of conversation flow. User Data:", userData);
        }
    }

    function triggerBotResponse() {
        const stepConfig = conversationFlow[currentStep];
        if (!stepConfig) return;

        if (stepConfig.generateSuggestions) {
            addMessage(stepConfig.botQuestion, 'bot'); // Ask the lead-in question
            setTimeout(generateAndShowSuggestions, 700); // Give a slight delay
        } else if (stepConfig.showOptions) {
            displayBotMessageWithOptions(stepConfig);
        }
        else {
            addMessage(stepConfig.botQuestion, 'bot');
        }
         // No automatic progression here for user input; wait for user to type or click
    }

    // --- Event Listeners ---
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserInput();
    });

    // --- Initialise Chat ---
    function startChat() {
        triggerBotResponse(); // Start with the first question from bot
    }

    startChat();
});