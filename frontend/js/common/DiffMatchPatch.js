import "./diff_match_patch/diff_match_patch.js";

/**
 * Simplified wrapper around the diff_match_patch library.
 */
export default class DiffMatchPatch {
  constructor() {
    this.dmp = new diff_match_patch();
  }

  /**
   * Returns diff from text1 to text2.
   * Diff will be cleaned up.
   */
  diff(text1, text2) {
    let diff = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diff);
    return diff;
  }

  /**
   * Generates a patch and applies it to text.
   * Returns the result of applying the patch.
   * The patch will be an exact patch.
   */
  applyDiffExact(text, diff) {
    // TODO make exact
    let patch = this.dmp.patch_make(text, diff);
    let newText = this.dmp.patch_apply(patch, text)[0];
    return newText;
  }

  /**
   * Like applyDiffExact but the patch is fuzzy.
   */
  applyDiffFuzzy(text, diff) {
    // TODO make fuzzy
    let patch = this.dmp.patch_make(text, diff);
    let newText = this.dmp.patch_apply(patch, text)[0];
    return newText;
  }
}
