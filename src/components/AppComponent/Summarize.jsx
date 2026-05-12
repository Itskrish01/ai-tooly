import StreamTool from "./StreamTool";

const SUMMARY_PROMPTS = {
  bullets:
    "Summarize the user's text as 3-6 concise bullet points capturing the key facts. Use '- ' for bullets. Return only the bullets.",
  tldr:
    "Summarize the user's text in a single TL;DR sentence (max 25 words). Return only the sentence.",
  paragraph:
    "Summarize the user's text in one tight paragraph (3-4 sentences). Return only the paragraph.",
};

const Summarize = () => (
  <StreamTool
    eyebrow="Summarize"
    inputLabel="long_text.md"
    outputLabel="summary.md"
    placeholder="Paste an article, email thread, or document…"
    actionLabel="Summarize"
    options={[
      { id: "bullets", label: "Bullets", hint: "Key points as a bullet list" },
      { id: "tldr", label: "TL;DR", hint: "One sentence" },
      { id: "paragraph", label: "Paragraph", hint: "Tight paragraph" },
    ]}
    defaultOption="bullets"
    maxLength={8000}
    buildSystem={({ option }) => SUMMARY_PROMPTS[option] || SUMMARY_PROMPTS.bullets}
  />
);

export default Summarize;
