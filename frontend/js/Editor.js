
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
   * Applies a patch created by the diff-match-patch library to the editor's
   * text.
   */
  applyPatch(patches) {
    for (const patch of patches) {
      let currentPos = patch.start1;
      for (const diff of patch.diffs) {
	let type = diff[0];
	let content = diff[1];
	if (type === 0) {
	  // Equality
	  currentPos += content.length;
	} else if (type === -1) {
	  // Deletion

	  // Convert index to row and column
	  let startRowCol = this.indexToRowColumn(currentPos);
	  let endRowCol = this.indexToRowColumn(currentPos + content.length);

	  // Note: Range from the ace library is different from the standard
	  // javascript Range class.
	  // https://stackoverflow.com/a/10460257
	  let AceRange = ace.require("ace/range").Range;
	  let range = new AceRange(
	    startRowCol.row,
	    startRowCol.column,
	    endRowCol.row,
	    endRowCol.column
	  );

	  this.editor.session.remove(range);
	} else if (type === 1) {
	  // Insertion
	  let rowColumn = this.indexToRowColumn(currentPos);
	  this.editor.session.insert(rowColumn, content);
	  currentPos += content.length;
	}

      }
    }
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

  /**
   * Converts a single index to a row and column position by counting newlines.
   * Returns an object of the form {row: row, column: column}
   */
  indexToRowColumn(index) {
    let row = 0;
    let column = 0;
    let text = this.getText();

    for (let i = 0; i < index; ++i) {
      ++column;
      let c = text.charAt(i);
      if (c === '\n') {
	++row;
	column = 0;
      }
    }

    return {row: row, column: column};
  }
}
