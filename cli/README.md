
# Ta5beesScript

## Features

- **Syntax Highlighting**: Enjoy color-coded clarity for Ta5beesScript.
- **Snippets**: Quickly spin up Ta5beesScript constructs with short codes.
- **Basic IntelliSense**: Some completion suggestions for common Ta5beesScript keywords.
- **Hover Hints**: Pointers on function declarations and variables.

---

## CLI Usage

### Installation

```sh
npm install -g ta5bees-cli
```

### Commands

- **Compile a Ta5beesScript file to JavaScript:**
  ```sh
  ta5bees compile <file.ta5bees> 
  ```

- **Run a Ta5beesScript file directly:**
  ```sh
  ta5bees run <file.ta5bees>
  ```

- **Watch mode for development:**
  ```sh
  ta5bees compile <file.ta5bees> -w
  ```

---

## Usage

1. **Install** the extension from the VS Code marketplace (or load it manually).
2. **Open** any file with a `.ta5bees` extension.
3. **Enjoy** syntax highlighting, snippets, and a comedic twist on your code.

Example snippet (Ta5beesScript):
\`\`\`ta5bees
khalli x = 5;
khalli y = 3;

arrifli add(a, b) {
  raje3li a + b;
}

gool(add(x, y)); // prints 8
\`\`\`

---

## Why I Made This Language

I was just sitting there, rewatching Charles Oliveira vs. Islam Makhachev for the fifth time instead of studying for my final that is the next day. Somewhere between rounds, I thought, "What if I made a programming language in Arabeezi? Like, just to say I did it hahaha. And maybe to mess with people who take TypeScript way too seriously."

Let’s talk about TypeScript for a second. It’s like that strict teacher who insists you show your work on every single step, even when the answer is obvious. Half the time, the error messages read like ancient hieroglyphics, and the other half, you're just arguing with the compiler about things you both know are true.

Anyways, to ensure Ta5beesScript doesn’t collapse after `khalli x = 5;`, it was built on TypeScript.

Ahahahahah.

---

## Requirements

- **VS Code 1.50+** (to ensure proper extension handling).
- **Node.js** (if you plan to compile or run Ta5beesScript with additional tools).
- No special system dependencies—just your sense of humor.

---

## Extension Settings

This extension contributes the following settings:

- `ta5bees.enable`: Enable/disable the Ta5bees extension.
- `ta5bees.lintOnSave`: Lint your .ta5bees files upon saving.
- `ta5bees.snippets`: Toggle built-in code snippets.

---

## Known Issues

- **Deep** IntelliSense is limited—this is basically a comedic side project, not the next big enterprise language.  
- **Refactoring Tools** are minimal because we’re still mocking TypeScript (and maybe ourselves).

---

## Release Notes

### 0.2
- Initial release of Ta5bees extension.
- Basic syntax highlighting, snippets, and comedic commentary.

## 0.1
- Initial release of Ta5beesScript.

---

**Enjoy coding in Ta5beesScript. - hlk**
