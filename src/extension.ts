import * as vscode from 'vscode';
import joinLines from './joinLines';

/**
 * Activates the Join Lines Plus Context Aware extension. This function is
 * called when the extension is first activated by VS Code. It registers the
 * commands for joining lines and copying the result to the clipboard.
 *
 * @param {vscode.ExtensionContext} context - The context in which the
 * extension is activated, provided by VS Code. This context is used to
 * register the commands and to subscribe to events such as editor actions.
 */
export function activate(context: vscode.ExtensionContext) {
  const commands = {
    jlca: vscode.commands.registerCommand(
      'join-lines-plus-context-aware.join',
      joinLinesCommand,
    ),

    jlca_copy: vscode.commands.registerCommand(
      'join-lines-plus-context-aware.joinToBuffer',
      joinLinesToBufferCommand,
    )
  };

  for (let disposable of Object.values(commands)) {
    context.subscriptions.push(disposable);
  }
}

/**
 * Deactivates the extension.
 *
 * This function is called when the extension is deactivated by VS Code.
 * It is used to clean up any resources or subscriptions that were created
 * during the activation of the extension. If the extension allocated any
 * resources (like timers or file watchers), or if it has any subscriptions
 * (like to events or UI components), this function should dispose of them
 * to ensure there are no memory leaks.
 *
 * @returns {void}
 */
export function deactivate() { }

/**
 * Joins selected lines in the active text editor using the `combineLines`
 * function and replaces the original selection with the combined lines.
 * This command is triggered by the user through the command palette or a
 * keybinding. If the selection includes the last line of the document, it
 * skips the operation to prevent errors. The operation is performed on all
 * current selections in the active text editor.
 *
 * @returns {Promise<void>} A promise that resolves when all edits have been
 * applied.
 */
async function joinLinesCommand() {
  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) {
    return;
  }

  const {document} = textEditor;

  await textEditor.edit(editBuilder => {
    for (const selection of textEditor.selections) {
      if (isLastLineInDocument(selection, document)) {
        return;
      }

      const lines = getLinesFromSelection(document, selection);
      const combinedLines = combineLines(lines);

      replaceEditorSelection(editBuilder, selection, combinedLines);
    }
  });
}

/**
 * Executes the command to join selected lines and copy the result to the 
 * clipboard. This function iterates over all selections in the active text 
 * editor, joins the lines within each selection, and then writes the joined 
 * lines to the system clipboard. If the selection includes the last line of 
 * the document, it skips the operation for that selection to prevent errors.
 *
 * @param {vscode.Selection} selection - The current selection in the document.
 * @param {vscode.TextDocument} document - The document containing the 
 * selection.
 * @returns {Promise<void>} A promise that resolves when the operation is 
 * complete.
 */
async function joinLinesToBufferCommand() {
  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) {
    return;
  }

  const {document} = textEditor;

  for (const selection of textEditor.selections) {
    if (isLastLineInDocument(selection, document)) {
      return;
    }

    const lines = getLinesFromSelection(document, selection);
    const combinedLines = combineLines(lines);

    await vscode.env.clipboard.writeText(combinedLines);
  }
}

/**
 * Checks if the selection's end line is the last line in the document.
 *
 * This function is useful for determining whether a given selection extends to
 * the end of the document, which can be important when deciding if certain
 * operations, such as joining lines, can be performed.
 *
 * @param {vscode.Selection} selection - The selection to check.
 * @param {vscode.TextDocument} document - The document in which the selection
 * resides.
 * @returns {boolean} - True if the selection's end line is the last line of the
 * document, otherwise false.
 */
function isLastLineInDocument(
  selection: vscode.Selection, 
  document: vscode.TextDocument
): boolean {
  return selection.end.line === document.lineCount - 1;
}

/**
 * Retrieves an array of strings representing the lines of text within a given
 * selection in a document.
 *
 * This function iterates over the lines in the provided selection, from the
 * start line to the end line, and collects each line's text into an array. If
 * the selection is a single line, it includes the next line as well. This is
 * useful for features that need to process or manipulate the text of a specific
 * section of a document.
 *
 * @param {vscode.TextDocument} document - The document from which to extract
 * lines.
 * @param {vscode.Selection} selection - The selection within the document
 * specifying the range of lines to retrieve.
 * @returns {string[]} An array of strings, each representing a line of text
 * from the document within the selection range.
 */
function getLinesFromSelection(
  document: vscode.TextDocument, 
  selection: vscode.Selection
): string[] {
  const lines = [];
  for (
    let i = selection.start.line; 
    i <= (
      selection.isSingleLine ? selection.start.line + 1 : selection.end.line
    ); 
    i++
  ) {
    lines.push(document.lineAt(i).text);
  }
  return lines;
}

/**
 * Combines an array of strings into a single string by concatenating them.
 * This function iteratively joins each line with the previous ones using a
 * context-aware joining function that respects language syntax for comments,
 * string literals, and various other constructs. The first line is used as the
 * initial value, and subsequent lines are joined one by one.
 *
 * @param {string[]} lines - An array of strings representing lines of text to
 * be combined.
 * @returns {string} - A single string with all lines combined.
 */
function combineLines(lines: string[]): string {
  return lines.reduce((combined: string, currentLine: string, index: number) => {
    return index === 0 ? currentLine : joinLines(combined, currentLine);
  }, '');
}

/**
 * Replaces the text of a given selection in the editor with combined lines.
 *
 * This function creates a range from the start of the selection to the end and
 * replaces the text within this range with the provided combined lines string.
 * If the selection is a single line, the range extends to the length of the
 * combined lines. If the selection spans multiple lines, the range extends to
 * the length of the last line in the combined lines string.
 *
 * @param {vscode.TextEditorEdit} editBuilder - The edit builder used to apply
 * the text edits.
 * @param {vscode.Selection} selection - The selection within the document to
 * replace.
 * @param {string} combinedLines - The new text to replace the selection with.
 */
function replaceEditorSelection(
  editBuilder: vscode.TextEditorEdit, 
  selection: vscode.Selection, 
  combinedLines: string
): void {
  const range = new vscode.Range(
    selection.start.line,

    0,

    selection.isSingleLine 
      ? selection.start.line + 1 
      : selection.end.line,

    selection.isSingleLine 
      ? combinedLines.length 
      : combinedLines.split('\n').pop()?.length ?? 0,
  );
  editBuilder.replace(range, combinedLines);
}
