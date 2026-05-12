import StreamTool from "./StreamTool";

const CodeExplain = () => (
  <StreamTool
    eyebrow="Code Explain"
    inputLabel="snippet.code"
    outputLabel="explanation.md"
    placeholder={`// Paste a code snippet in any language\nfunction debounce(fn, ms) { ... }`}
    actionLabel="Explain"
    options={[
      { id: "summary", label: "Summary", hint: "What does it do, in plain English" },
      { id: "line", label: "Line-by-line", hint: "Walk through each line" },
      { id: "review", label: "Review", hint: "Bugs, improvements, security" },
    ]}
    defaultOption="summary"
    maxLength={6000}
    monoOutput
    buildSystem={({ option }) => {
      const base =
        "You are a senior engineer reviewing the snippet. Be precise and avoid filler. Use markdown when helpful.";
      if (option === "line")
        return `${base} Walk through the code line-by-line. For each meaningful line or block, quote it (in a code fence) and explain what it does and why.`;
      if (option === "review")
        return `${base} Review the code: list bugs, edge cases, security issues, and concrete improvements. Group findings under '### Bugs', '### Improvements', '### Security'. Be brief.`;
      return `${base} Explain in 3-5 short paragraphs: what it does, the inputs/outputs, and any non-obvious behavior. Skip line-by-line details.`;
    }}
  />
);

export default CodeExplain;
