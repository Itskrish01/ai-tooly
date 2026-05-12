import StreamTool from "./StreamTool";

const TONE = {
  standard:
    "Rewrite the user's text to improve clarity and flow while preserving meaning. Keep approximately the same length. Return ONLY the rewritten text.",
  concise:
    "Rewrite the user's text to be shorter and punchier. Cut filler. Preserve meaning. Return ONLY the rewritten text.",
  formal:
    "Rewrite the user's text in a formal, professional register suitable for business writing. Return ONLY the rewritten text.",
  casual:
    "Rewrite the user's text in a friendly, casual conversational tone. Return ONLY the rewritten text.",
  academic:
    "Rewrite the user's text in an academic register with precise vocabulary and formal structure. Return ONLY the rewritten text.",
};

const Rephrase = () => (
  <StreamTool
    eyebrow="Rephrase"
    inputLabel="draft.txt"
    outputLabel="rephrased.txt"
    placeholder="Paste a sentence or paragraph to rewrite…"
    actionLabel="Rephrase"
    options={[
      { id: "standard", label: "Standard" },
      { id: "concise", label: "Concise" },
      { id: "formal", label: "Formal" },
      { id: "casual", label: "Casual" },
      { id: "academic", label: "Academic" },
    ]}
    defaultOption="standard"
    maxLength={2000}
    buildSystem={({ option }) => TONE[option] || TONE.standard}
  />
);

export default Rephrase;
