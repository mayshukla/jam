
/**
 * Wrapper around ace editor.
 */
export default class Editor {
  constructor(id) {
    this.editor = ace.edit(id);
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/javascript");
  }

  getText() {
    return this.editor.getValue();
  }

  setText(text) {
    this.editor.setValue(text);
    this.editor.selection.clearSelection();
  }

  addEditListener(callback) {
    this.editor.addEventListener("input", callback);
  }
}
