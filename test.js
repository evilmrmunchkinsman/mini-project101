const API_KEY = "AIzaSyD31fpwVi8sEPFrBbOR6xpF9n_aTA2nPrA";

async function run() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Hello" }],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  console.log(data);
}

run();