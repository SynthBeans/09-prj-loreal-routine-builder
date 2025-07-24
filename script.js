// Assuming 'selectedProducts' is the array or data you are sending to the Worker
async function generateRoutine() {
  try {
    // Log the request you're sending to the Worker
    console.log("Sending request to Worker:", selectedProducts);

    // Sending data to the Cloudflare Worker
    const response = await fetch('https://workerthingyhelpme.xxsynth.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: selectedProducts // or use prompt: "some text"
      }),
    });

    // Get the raw response text for debugging
    const textResponse = await response.text();
    console.log("Raw response:", textResponse); // Log the raw response text

    // Check if the response is empty or invalid
    if (!textResponse || textResponse.trim() === "") {
      chatWindow.innerHTML = "No response from the API.";
      return;
    }

    // Parse the response as JSON
    const result = JSON.parse(textResponse);
    console.log("Parsed response:", result);

    // Handle the AI response if it's valid
    if (result && result.choices) {
      // Assuming you want to display the generated routine in the chat window
      chatWindow.innerHTML = result.choices[0].message.content;
    } else {
      chatWindow.innerHTML = "No valid response from the API.";
    }
  } catch (err) {
    // Catch and display any errors that occur during the fetch request
    console.error("Error while generating routine:", err);
    chatWindow.innerHTML = "Something went wrong. Please try again.";
  }
}

// Example of an event listener or function that calls `generateRoutine`
document.getElementById('generateRoutine').addEventListener('click', generateRoutine);

// Assuming you also want to handle sending questions through the chat
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Log the user input
  const userInputText = document.getElementById('userInput').value;
  console.log("User input to chat:", userInputText);

  // Send user input to Worker as a prompt
  const response = await fetch('https://workerthingyhelpme.xxsynth.workers.dev/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: userInputText // Send the user input as a prompt
    }),
  });

  // Get the raw response text
  const textResponse = await response.text();
  console.log("Raw response:", textResponse); // Log the raw response text

  // Check if the response is empty or invalid
  if (!textResponse || textResponse.trim() === "") {
    chatWindow.innerHTML += "<p>No response from the API.</p>";
    return;
  }

  // Parse the response as JSON
  const result = JSON.parse(textResponse);
  console.log("Parsed response:", result);

  // Display the AI's response in the chat window
  if (result && result.choices) {
    chatWindow.innerHTML += "<p>" + result.choices[0].message.content + "</p>";
  } else {
    chatWindow.innerHTML += "<p>No valid response from the API.</p>";
  }

  // Clear the input field after sending
  document.getElementById('userInput').value = '';
});
