import type { ReactNode } from "react";

// Renders the light markdown used in lib/marketing/odoo-guides.ts:
// paragraphs split by blank lines, "1. " lines as ordered lists, and inline
// **bold**, *italic* and `code`. Nothing else, so the published text stays
// exactly the approved text.

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/;

export function renderOdooGuideInline(text: string, keyPrefix = "i"): ReactNode[] {
  return text
    .split(INLINE)
    .filter((part) => part !== "")
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
        return (
          <code key={key} className="rounded bg-[#0D0F0E]/[0.06] px-1 py-0.5 font-mono text-[0.9em] text-[#0D0F0E]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={key} className="font-semibold text-[#0D0F0E]">
            {renderOdooGuideInline(part.slice(2, -2), key)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={key}>{renderOdooGuideInline(part.slice(1, -1), key)}</em>;
      }
      return part;
    });
}

type Block = { kind: "p"; text: string } | { kind: "ol"; items: string[] };

function toBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const para of body.split(/\n\s*\n/)) {
    let list: string[] | null = null;
    for (const line of para.split("\n")) {
      const item = /^\d+\.\s+(.*)$/.exec(line);
      if (item) {
        if (!list) {
          list = [];
          blocks.push({ kind: "ol", items: list });
        }
        list.push(item[1]);
      } else if (line.trim() !== "") {
        list = null;
        blocks.push({ kind: "p", text: line });
      }
    }
  }
  return blocks;
}

export function OdooGuideText({ body }: { body: string }) {
  return (
    <div className="flex flex-col gap-5 text-base leading-7 text-[#2b2b28]">
      {toBlocks(body).map((block, index) =>
        block.kind === "p" ? (
          <p key={index}>{renderOdooGuideInline(block.text, `p${index}`)}</p>
        ) : (
          <ol key={index} className="flex list-decimal flex-col gap-2 pl-6">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderOdooGuideInline(item, `l${index}-${itemIndex}`)}</li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
