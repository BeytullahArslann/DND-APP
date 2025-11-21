import React from 'react';

// Regex to match {@tag content}
const TAG_REGEX = /\{@([a-z]+) ([^}]+)\}/g;

export const parseRuleText = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = TAG_REGEX.exec(text)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const tagType = match[1];
    const content = match[2];

    // Handle pipe for display text (e.g., "fireball|phb|Fireball Spell")
    const pipeParts = content.split('|');
    const displayText = pipeParts.length > 1 && pipeParts[pipeParts.length - 1] !== ""
      ? pipeParts[pipeParts.length - 1]
      : pipeParts[0];

    // Add the styled tag content
    switch (tagType) {
      case 'b':
        parts.push(<strong key={match.index}>{displayText}</strong>);
        break;
      case 'i':
        parts.push(<em key={match.index}>{displayText}</em>);
        break;
      case 'spell':
        parts.push(<span key={match.index} className="text-purple-400 font-medium cursor-help" title="Spell">{displayText}</span>);
        break;
      case 'condition':
        parts.push(<span key={match.index} className="text-yellow-400 font-medium cursor-help" title="Condition">{displayText}</span>);
        break;
      case 'item':
        parts.push(<span key={match.index} className="text-blue-400 font-medium" title="Item">{displayText}</span>);
        break;
      case 'class':
        parts.push(<span key={match.index} className="text-green-400 font-medium" title="Class">{displayText}</span>);
        break;
      case 'skill':
        parts.push(<span key={match.index} className="text-orange-400 font-medium" title="Skill">{displayText}</span>);
        break;
      case 'action':
        parts.push(<span key={match.index} className="text-red-400 font-medium" title="Action">{displayText}</span>);
        break;
      case 'note':
        parts.push(<span key={match.index} className="text-gray-400 italic text-sm">({displayText})</span>);
        break;
      default:
        parts.push(<span key={match.index} className="text-cyan-400">{displayText}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};
