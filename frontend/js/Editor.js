
/**
 * Wrapper around ace editor.
 */
export default class Editor {
  LIGHT_THEME = "ace/theme/github";
  DARK_THEME = "ace/theme/monokai";

  constructor(id) {
    this.editor = ace.edit(id);
    this.editor.setTheme(this.LIGHT_THEME);
    this.editor.session.setMode("ace/mode/javascript");

    // Default to sublime keybindings
    this.editor.setKeyboardHandler("ace/keyboard/sublime");

    this.keybindingsSelector = document.querySelector("#keybindings");
    this.keybindingsSelector.addEventListener("input", () => {
      this.selectKeybindings();
    });

    this.themeSelector = document.querySelector("#theme");
    this.themeSelector.addEventListener("input", () => {
      this.selectTheme();
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
    }
  }

  selectTheme() {
    let index = this.themeSelector.selectedIndex;
    let value = this.themeSelector.options[index].value;
    if (value === "light") {
      this.editor.setTheme(this.LIGHT_THEME);
    } else if (value === "dark") {
      this.editor.setTheme(this.DARK_THEME);
    }
  }
}
