/**
 * Responsible for displaying diagnostics such as error messages to the user.
 */
export default class Diagnostics {
  constructor() {
    this.element = document.querySelector("#diagnostics");
  }

  clear() {
    this.element.innerHTML = "";
  }

  printError(error) {
    // Also print to console since more information is often printed there.
    console.error("Error from user code:", error);

    this.element.innerHTML += '<p class="error">' + error + '</p>';;
  }

  print(text) {
    this.element.innerHTML += '<p>' + text + '</p>';
  }
}
