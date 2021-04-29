
/**
 * Wrapper around ace editor.
 */
export default class Editor {
  constructor(id) {
    this.editor = ace.edit(id);
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/javascript");

    // Default to sublime keybindings
    this.editor.setKeyboardHandler("ace/keyboard/sublime");

    this.keybindingsSelector = document.querySelector("#keybindings");
    this.keybindingsSelector.addEventListener("input", () => {
      this.selectKeybindings();
    });
  }

  getText() {
    return this.editor.getValue();
  }

  setText(text) {
    // Save cursor
    let cursor = this.editor.selection.getCursor();

    this.editor.setValue(text);

    // Restore cursor
    // TODO move cursor down if text changed above.
    // TODO restore selection
    this.editor.selection.clearSelection();
    this.editor.selection.moveCursorTo(cursor.row, cursor.column);
  }

  addEditListener(callback) {
    this.editor.addEventListener("input", callback);
  }

  /**
   * Returns a object with .row and .column
   */
  getCursor() {
    return this.editor.selection.getCursor();
  }

  selectKeybindings() {
    let index = this.keybindingsSelector.selectedIndex;
    let value = this.keybindingsSelector.options[index].value;
    if (value === "emacs") {
      this.editor.setKeyboardHandler("ace/keyboard/emacs");
    } else if (value === "vim") {
      this.editor.setKeyboardHandler("ace/keyboard/vim");
    } else if (value === "sublime") {
      this.editor.setKeyboardHandler("ace/keyboard/sublime");
    } else if (value === "vscode") {
      this.editor.setKeyboardHandler("ace/keyboard/vscode");
    }
  }
}
