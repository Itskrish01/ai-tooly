import StreamTool from "./StreamTool";

const GrammarFix = () => (
  <StreamTool
    eyebrow="Grammar Fix"
    inputLabel="draft.txt"
    outputLabel="fixed.txt"
    placeholder="Paste a sentence or paragraph to clean up…"
    actionLabel="Fix"
    options={[
      { id: "fix", label: "Fix", hint: "Minimal corrections only" },
      { id: "polish", label: "Polish", hint: "Fix + improve flow" },
      { id: "explain", label: "Explain", hint: "Show the corrections" },
    ]}
    defaultOption="fix"
    maxLength={4000}
    buildSystem={({ option }) => {
      if (option === "explain")
        return "Correct grammar, spelling, and punctuation in the user's text. Return the corrected version followed by a short list of the changes you made (format: '- changed X to Y because…'). Do not add extra commentary.";
      if (option === "polish")
        return "Correct grammar, spelling, and punctuation, AND improve sentence flow and word choice while preserving meaning. Return ONLY the improved text.";
      return "Correct grammar, spelling, and punctuation in the user's text without changing meaning, voice, or tone. Return ONLY the corrected text—no explanations, quotes, or preamble.";
    }}
  />
);

export default GrammarFix;
