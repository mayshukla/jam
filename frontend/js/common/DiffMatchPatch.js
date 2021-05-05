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
    // TODO is cleanup worthwhile?
    this.dmp.diff_cleanupSemantic(diff);
    return diff;
  }

  /**
   * Generates a patch and applies it to text.
   * Returns the result of applying the patch.
   * The patch will be an exact patch.
   */
  applyDiffExact(text, diff) {
    this.setExactSettings();

    let patch = this.createPatchExact(text, diff);
    let newText = this.dmp.patch_apply(patch, text)[0];
    return newText;
  }

  /**
   * Like applyDiffExact but the patch is fuzzy.
   */
  applyDiffFuzzy(text, diff) {
    this.setFuzzySettings();

    let patch = this.createPatchFuzzy(text, diff);
    let newText = this.dmp.patch_apply(patch, text)[0];
    return newText;
  }

  /**
   * Returns an exact patch.
   */
  createPatchExact(text, diff) {
    this.setExactSettings();
    return this.dmp.patch_make(text, diff);
  }

  /**
   * Returns a fuzzy patch.
   */
  createPatchFuzzy(text, diff) {
    this.setFuzzySettings();
    return this.dmp.patch_make(text, diff);
  }

  setExactSettings() {
    this.dmp.Match_Distance = 0;
    this.dmp.Match_Threshold = 0;
    this.dmp.Patch_DeleteThreshold = 0;
  }

  setFuzzySettings() {
    // TODO experiment with different values
    this.dmp.Match_Distance = 1000;
    this.dmp.Match_Threshold = 0.5;
    this.dmp.Patch_DeleteThreshold = 0.5;
  }

  /**
   * Returns true if the given diff is empty.
   */
  isDiffEmpty(diff) {
    for (const item of diff) {
      if (item[0] !== 0) {
	return false;
      }
    }
    return true;
  }
}
