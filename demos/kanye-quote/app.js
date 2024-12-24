async function fetchData() {
  try {
    const response = await fetch("https://api.kanye.rest");
    const data = await response.json();
    const factElem = document.getElementById("textDisplay");
    factElem.textContent = data.quote;
  } catch (error) {
    console.log("Fetch Error: " + error);
  }

}
//# sourceMappingURL=app.js.map