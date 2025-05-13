document.getElementById("send-button").addEventListener("click", sendMessage);
document
	.getElementById("chat-input")
	.addEventListener("keypress", function (e) {
		if (e.key === "Enter") {
			sendMessage();
		}
	});

function sendMessage() {
	const input = document.getElementById("chat-input");
	const message = input.value.trim();
	if (message === "") return;

	addMessageToChat("You", message);
	input.value = "";

	fetch("http://localhost:8000/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message, session: currentSession }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.followUp) {
				addMessageToChat("Bot", data.followUp);
			} else {
				addMessageToChat("Bot", data.message);
			}
			currentSession = data.session;
		})
		.catch((error) => {
			console.error("Error:", error);
			addMessageToChat("Bot", "Sorry, something went wrong.");
		});
}

function addMessageToChat(sender, message) {
	const chatBox = document.getElementById("chat-box");
	const messageElement = document.createElement("div");
	messageElement.textContent = `${sender}: ${message}`;
	chatBox.appendChild(messageElement);
	chatBox.scrollTop = chatBox.scrollHeight;
}

let currentSession = {};
