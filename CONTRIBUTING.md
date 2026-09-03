# Contributing

As of September 2026, Somtoday Mod does not accept new Pull Requests. The reason being that I, as the maintainer, do not have access to Somtoday anymore, and do not wish the Somtoday Mod codebase upon anyone else. I started this in 2021 as just a small personal userscript. As it was one of my first projects for learning how to code, it's an absolute mess. I'm sorry.


**For those who wish to fork Somtoday Mod:**
- ***You'll probably want to install the browser extension locally**. Either the Chromium or Firefox version.*
  - To do this, follow the steps described in README.md
- ***There's multiple versions of the same code in this repo**. Each version has it's own folder.*
  - I'd recommend to only update/change the version you're using yourself, no need to do the extra work of copying everything
  - However, if you have a PHP server with Composer, you can run `generate.php` to update the contents in the other folders 
- *Do not touch the `// [GENERATION]` comments*
  - These are used by `generate.php` to generate the Android and userscript versions
