import React from 'react';

interface ParticularsRendererProps {
  text: string;
  className?: string;
}

/**
 * Intelligently formats quotation particulars text into professional commercial specs:
 * 1. Line 1 is rendered as the bold Product/Service Title.
 * 2. Key-value lines (e.g. "Capacity: ...", "Spare parts: ...") have bold labels.
 * 3. Bullet points (-, *, •) are rendered with clean indentation and dots.
 * 4. Punctuation formatting (e.g. rogue spaces before commas) is auto-sanitized so commas never wrap to line starts.
 */
export default function ParticularsRenderer({ text, className = '' }: ParticularsRendererProps) {
  if (!text) return null;

  // Sanitize punctuation: eliminate spaces before commas, colons, or semicolons
  const sanitizedText = text
    .replace(/\s+([,:;.])/g, '$1')
    .replace(/,\s*/g, ', ');

  const rawLines = sanitizedText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return null;

  // Determine if the first line is the product/service heading
  const isFirstLineHeading = !rawLines[0].startsWith('•') && 
                            !rawLines[0].startsWith('-') && 
                            !rawLines[0].startsWith('*');

  return (
    <div className={`text-neutral-900 text-[10.5px] leading-normal space-y-0.5 ${className}`}>
      {rawLines.map((line, index) => {
        // First line: Product / Service Title
        if (index === 0 && isFirstLineHeading) {
          // If first line explicitly starts with "Product:" or "Item:", extract value
          const titleKeyMatch = line.match(/^(product|item|service|title|particulars)\s*:\s*(.+)$/i);
          const displayTitle = titleKeyMatch ? titleKeyMatch[2] : line;

          return (
            <div
              key={index}
              className="font-semibold text-neutral-950 text-[10.5px] leading-snug mb-0.5"
            >
              {displayTitle}
            </div>
          );
        }

        // Bullet point lines (-, *, •, or numbered like 01., 1.)
        const bulletMatch = line.match(/^([•\-\*]|\d{1,2}\.)\s*(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[2];
          const colonMatch = content.match(/^([^:]+:)\s*(.+)$/);

          return (
            <div key={index} className="flex items-start space-x-1.5 pl-0.5 text-[10px]">
              <span className="text-neutral-400 font-bold select-none leading-none mt-0.5">•</span>
              <div className="leading-snug flex-1">
                {colonMatch ? (
                  <>
                    <span className="font-medium text-neutral-800">{colonMatch[1]} </span>
                    <span className="text-neutral-600 font-normal">{colonMatch[2]}</span>
                  </>
                ) : (
                  <span className="text-neutral-600 font-normal">{content}</span>
                )}
              </div>
            </div>
          );
        }

        // Key-Value specifications (e.g. "Capacity: 75Kw...", "Spare parts: ...", "Brand: ...")
        const keyValMatch = line.match(/^([^:]+:)\s*(.+)$/);
        if (keyValMatch) {
          const keyLabel = keyValMatch[1];
          const valText = keyValMatch[2];

          return (
            <div key={index} className="text-[10px] leading-snug">
              <span className="font-medium text-neutral-800">{keyLabel} </span>
              <span className="text-neutral-600 font-normal">{valText}</span>
            </div>
          );
        }

        // Regular text line
        return (
          <div key={index} className="text-[10px] text-neutral-600 font-normal leading-snug">
            {line}
          </div>
        );
      })}
    </div>
  );
}
