import type { Token, Tokens } from "marked";

const noteMarker = /^\[!note\][ \t]*/i;
const breakHtml = /^<br\s*\/?>$/i;

function textToken(text: string): Tokens.Text {
	return { type: "text", raw: text, text, escaped: false };
}

function isBreak(token: Token) {
	if (token.type === "br") {
		return true;
	}

	if (token.type !== "html") {
		return false;
	}

	const source = "text" in token ? String(token.text) : token.raw;
	return breakHtml.test(source.trim());
}

function hasVisibleInline(tokens: Token[]) {
	return tokens.some((token) => {
		if (token.type === "text" || token.type === "escape") {
			return token.text.trim().length > 0;
		}

		return token.type !== "space";
	});
}

function splitNoteInline(
	tokens: Token[],
): { title: Token[]; rest: Token[] } | null {
	const [first, ...tail] = tokens;
	if (first?.type !== "text") {
		return null;
	}

	const match = first.text.match(noteMarker);
	if (!match) {
		return null;
	}

	const title: Token[] = [];
	const rest: Token[] = [];
	let broken = false;
	const rewritten: Token[] = [
		textToken(first.text.slice(match[0].length)),
		...tail,
	];

	for (const token of rewritten) {
		if (broken) {
			if (rest.length === 0 && token.type === "text") {
				const trimmed = token.text.replace(/^\n+/, "");
				if (trimmed.length > 0) {
					rest.push(textToken(trimmed));
				}
				continue;
			}

			rest.push(token);
			continue;
		}

		if (isBreak(token)) {
			broken = true;
			continue;
		}

		if (token.type === "text" && token.text.includes("\n")) {
			const index = token.text.indexOf("\n");
			const head = token.text.slice(0, index).trimEnd();
			const tailText = token.text.slice(index + 1).replace(/^\n+/, "");
			if (head.length > 0) {
				title.push(textToken(head));
			}
			if (tailText.length > 0) {
				rest.push(textToken(tailText));
			}
			broken = true;
			continue;
		}

		title.push(token);
	}

	const last = title.at(-1);
	if (last?.type === "text") {
		title[title.length - 1] = textToken(last.text.trimEnd());
	}

	return {
		title: title.filter(
			(token) => token.type !== "text" || token.text.length > 0,
		),
		rest,
	};
}

export function extractNoteCallout(
	tokens: Token[],
): { title: Token[]; body: Token[] } | null {
	const first = tokens[0];
	if (first?.type !== "paragraph" || !first.tokens?.length) {
		return null;
	}

	const split = splitNoteInline(first.tokens);
	if (!split) {
		return null;
	}

	const body = tokens.slice(1);
	if (hasVisibleInline(split.rest)) {
		const paragraph: Tokens.Paragraph = {
			type: "paragraph",
			raw: split.rest.map((token) => token.raw).join(""),
			text: split.rest
				.map((token) => ("text" in token ? token.text : ""))
				.join(""),
			tokens: split.rest,
		};
		body.unshift(paragraph);
	}

	return { title: split.title, body };
}
