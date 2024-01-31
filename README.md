# Join Lines Plus Context Aware

A language-agnostic, context-aware Join Lines command for VS Code. This is a fork of Ian Obermiller's extension "Join Lines Context Aware". It has been modified to allow moving the
joined content directly to the clipboard as well as being able to select large blocks of code
and apply all at once.

![Extension Logo](./images/join-lines-plus-context-aware-exticon.png)

## Features

- Merge string literals - single or double quote, `+`, `.`, or nothing as concat operator
- Merges line and docblock comments (supports `//`, `#`, `*`, and `;`)
- Removes trailing commas and omits spaces when merging onto a line with an opening or closing brace (`[]`, `{}`, `()`, or `<>`)

## Usage

After installing the extension, add a keybinding for it. The default Join Lines
command is `ctrl+j` or `cmd+j` on Mac.

```
{
  "key": "ctrl+j",
  "command": "join-lines-plus-context-aware.join"
},
{
  "key": "ctrl+shift+j",
  "command": "join-lines-plus-context-aware.joinToBuffer"
}
```

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.12

- Previously would not join lines if the last line in the document was also selected. 
  This is now only true if the first and last line selected are the last line.

### 1.0.10

- Sigh, off by one issue. Added toast for clipboard action to make up for it.

### 1.0.9

- Through much trial and error, the regexp escape issue has been found and squashed. Enjoy

### 1.0.2

- Forked from Ian Obermiller's 1.0.1 code

### 1.0.1

- Fix joining the first two lines of C-style block comments, thanks @Fbonazzi

### 1.0.0

- Initial release, ported from the [Join Lines Smarter Atom Extension](https://github.com/ianobermiller/join-lines-smarter).
