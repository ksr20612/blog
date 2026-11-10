import { Renderer, type Token, type Tokens } from "marked";

const tableFencePattern = /^\s*(`{3,}|~{3,})/;
const tableDelimiterCellPattern = /^:?-{3,}:?$/;

function splitTableRow(line: string): string[] | null {
	const trimmed = line.trim();
	if (!trimmed.includes("|")) {
		return null;
	}

	let body = trimmed;
	if (body.startsWith("|")) {
		body = body.slice(1);
	}
	if (body.endsWith("|")) {
		body = body.slice(0, -1);
	}

	const cells: string[] = [];
	let current = "";
	for (let index = 0; index < body.length; index += 1) {
		const character = body[index];
		if (character === "\\" && body[index + 1] === "|") {
			current += "|";
			index += 1;
			continue;
		}
		if (character === "|") {
			cells.push(current.trim());
			current = "";
			continue;
		}
		current += character;
	}
	cells.push(current.trim());
	return cells;
}

function isDelimiterRow(cells: string[]): boolean {
	return (
		cells.length > 0 &&
		cells.every((cell) => tableDelimiterCellPattern.test(cell))
	);
}

function padTableHeader(line: string, missing: number): string {
	const trimmedEnd = line.trimEnd();
	const addition = Array.from({ length: missing }, () => " |").join("");
	if (trimmedEnd.endsWith("|")) {
		return `${trimmedEnd}${addition}`;
	}
	return `${trimmedEnd}${addition} |`;
}

export function normalizeMarkdownTableHeaders(markdown: string): string {
	const lines = markdown.split("\n");
	let inFence = false;

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? "";
		if (tableFencePattern.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence || index === 0) {
			continue;
		}

		const delimiter = splitTableRow(line);
		if (!delimiter || !isDelimiterRow(delimiter)) {
			continue;
		}

		const headerLine = lines[index - 1] ?? "";
		if (headerLine.trim().length === 0) {
			continue;
		}

		const header = splitTableRow(headerLine);
		if (
			!header ||
			isDelimiterRow(header) ||
			delimiter.length <= header.length
		) {
			continue;
		}

		lines[index - 1] = padTableHeader(
			headerLine,
			delimiter.length - header.length,
		);
	}

	return lines.join("\n");
}

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

function nonEmptyCells(row: Tokens.TableCell[]): Tokens.TableCell[] {
	return row.filter((cell) => cell.text.trim().length > 0);
}

function rowIsNote(row: Tokens.TableCell[]): boolean {
	const cells = nonEmptyCells(row);
	return cells.length === 0 || cells.every((cell) => !cellHasImage(cell));
}

function rowIsImages(row: Tokens.TableCell[]): boolean {
	const cells = nonEmptyCells(row);
	return cells.length > 0 && cells.every((cell) => cellHasImage(cell));
}

function isCaptionFigureTable(token: Tokens.Table): boolean {
	const hasImage =
		token.header.some(cellHasImage) ||
		token.rows.some((row) => row.some(cellHasImage));
	if (!hasImage) {
		return false;
	}

	if (token.header.length <= 1) {
		return true;
	}

	if (token.header.some(cellHasImage)) {
		return false;
	}

	return token.rows.every((row) => rowIsNote(row) || rowIsImages(row));
}

function inlineHtml(
	parser: Renderer["parser"],
	cell: Tokens.TableCell,
): string {
	if (cell.text.trim().length === 0) {
		return "";
	}
	return parser.parseInline(cell.tokens).trim();
}

function renderCaptionFigure(
	parser: Renderer["parser"],
	token: Tokens.Table,
): string {
	const headerTexts = token.header
		.map((cell) => cell.text.trim())
		.filter((text) => text.length > 0);
	const useColumnLabels =
		token.header.length > 1 && new Set(headerTexts).size > 1;
	const captionCell = useColumnLabels
		? undefined
		: (token.header.find((cell) => cell.text.trim().length > 0) ??
			token.header[0]);
	const caption = captionCell ? inlineHtml(parser, captionCell) : "";
	const cells: string[] = [];
	const notes: string[] = [];

	if (useColumnLabels) {
		for (const cell of token.header) {
			cells.push(
				`<div class="markdown-figure-label">${inlineHtml(parser, cell)}</div>`,
			);
		}
	}

	for (const row of token.rows) {
		if (!rowIsImages(row)) {
			const note = nonEmptyCells(row)
				.map((cell) => inlineHtml(parser, cell))
				.filter((html) => html.length > 0)
				.join("<br>");
			if (note) {
				notes.push(note);
			}
			continue;
		}

		for (const cell of row) {
			cells.push(
				`<div class="markdown-figure-item">${inlineHtml(parser, cell)}</div>`,
			);
		}
	}

	const columnCount = token.header.length;
	const mediaHtml =
		cells.length > 0
			? `<div class="markdown-figure-media"><div class="markdown-figure-row" style="--figure-cols: ${columnCount}" data-cols="${columnCount}">${cells.join("")}</div></div>`
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
