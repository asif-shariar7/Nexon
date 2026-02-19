const API_KEY = "PUT_YOUR_OWN_APIKEY";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const navItems = document.querySelectorAll(".nav-links a");

// Toggle menu
menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Close menu when clicking a link
navItems.forEach(item => {
    item.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});

async function generateResponse(prompt) {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    if (!isUser) {
        // Format paragraphs professionally
        const formatted = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br><br>');

        messageContent.innerHTML = formatted;
    } else {
        messageContent.textContent = message;
    }

    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true);
    userInput.value = "";

    // Disable while waiting
    sendButton.disabled = true;
    userInput.disabled = true;

    // Add typing indicator
    const typingElement = document.createElement("div");
    typingElement.classList.add("message", "bot-message");
    typingElement.innerHTML = `
        <div class="message-content typing">
            Nexon is typing<span class="dots">...</span>
        </div>
    `;

    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const botReply = await generateResponse(userMessage);

        chatMessages.removeChild(typingElement);
        addMessage(botReply, false);

    } catch (error) {
        chatMessages.removeChild(typingElement);
        addMessage("Sorry, something went wrong.", false);
    }

    // Enable again
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.focus();
}

sendButton.addEventListener("click", handleUserInput);

userInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        handleUserInput();
    }
});