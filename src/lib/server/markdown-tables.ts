import { Renderer, type Token, type Tokens } from "marked";

function tokensContainImage(tokens: Token[] | undefined): boolean {
	if (!tokens) {
		return false;
	}

	for (const token of tokens) {
		if (token.type === "image") {
			return true;
		}

		if ("tokens" in token) {
			const nested = token.tokens;
			if (Array.isArray(nested) && tokensContainImage(nested)) {
				return true;
			}
		}
	}

	return false;
}

function cellHasImage(cell: Tokens.TableCell): boolean {
	return tokensContainImage(cell.tokens);
}

function isCaptionFigureTable(token: Tokens.Table): boolean {
	if (token.header.length !== 1) {
		return false;
	}

	return (
		token.header.some(cellHasImage) ||
		token.rows.some((row) => row.some(cellHasImage))
	);
}

function renderCaptionFigure(
	parser: Renderer["parser"],
	token: Tokens.Table,
): string {
	const headerCell = token.header[0];
	const caption = headerCell
		? parser.parseInline(headerCell.tokens).trim()
		: "";
	const media: string[] = [];
	const notes: string[] = [];

	for (const row of token.rows) {
		const cell = row[0];
		if (!cell) {
			continue;
		}

		const html = parser.parseInline(cell.tokens).trim();
		if (!html) {
			continue;
		}

		if (cellHasImage(cell)) {
			media.push(`<div class="markdown-figure-item">${html}</div>`);
		} else {
			notes.push(html);
		}
	}

	const mediaHtml =
		media.length > 0
			? `<div class="markdown-figure-media">${media.join("")}</div>`
			: "";
	const noteHtml =
		notes.length > 0
			? `<span class="markdown-figure-note">${notes.join("<br>")}</span>`
			: "";
	const captionHtml =
		caption || noteHtml ? `<figcaption>${caption}${noteHtml}</figcaption>` : "";

	return `<figure class="markdown-figure not-prose">${mediaHtml}${captionHtml}</figure>\n`;
}

export function renderMarkdownTable(
	this: Renderer,
	token: Tokens.Table,
): string {
	if (isCaptionFigureTable(token)) {
		return renderCaptionFigure(this.parser, token);
	}

	return `<div class="markdown-table-wrap not-prose">${Renderer.prototype.table.call(this, token)}</div>\n`;
}
