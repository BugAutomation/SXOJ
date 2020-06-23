const MarkdownIt = require('markdown-it');

const md = MarkdownIt();
const Prism = require('prismjs');

// For math: $a\times b\eq 10$
const katex = require('markdown-it-katex');
// Specific image size: ![image](image.png =100x100)
const Imsize = require('markdown-it-imsize');
/* Footnote support.
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.
*/
const Footnote = require('markdown-it-footnote');
// ==Highlight==
const Mark = require('markdown-it-mark');
// :::warn This page requires javascript. :::
// :::record-pass Accepted :::
const Container = require('markdown-it-container');
let Anchor = require('markdown-it-anchor');
// For webpack
if (Anchor.default) Anchor = Anchor.default;

const TOC = require('markdown-it-table-of-contents');

require('prismjs/components/index');

class Markdown extends MarkdownIt {
    constructor(safe) {
        super({
            linkify: true,
            highlight(str, lang) {
                if (lang && Prism.languages[lang]) {
                    try {
                        return Prism.highlight(str, Prism.languages[lang], lang);
                    } catch (__) { } // eslint-disable-line no-empty
                }
                return '';
            },
            html: !safe,
        });
        this.linkify.tlds('.py', false);
        this.use(katex);
        this.use(Imsize);
        this.use(Footnote);
        this.use(Mark);
        this.use(Anchor);
        this.use(TOC);
        const RE_CONTAINER = /^(note|warn|record-pending|record-progress|record-fail|record-pass|record-ignored)\s+(.*?):::(.*)$/;
        const CONTAINER_MAP = {
            note: ['<blockquote class="note">', '</blockquote>'],
            warn: ['<blockquote class="warn">', '</blockquote>'],
            'record-pending': ['<span class="record-status--text pending">', '</span>'],
            'record-progress': ['<span class="record-status--text progress">', '</span>'],
            'record-fail': ['<span class="record-status--text fail">', '</span>'],
            'record-pass': ['<span class="record-status--text pass">', '</span>'],
            'record-ignored': ['<span class="record-status--text ignored">', '</span>'],
        };
        this.use(Container, 'blockquote', {
            validate(params) {
                return params.trim().match(RE_CONTAINER);
            },
            render(tokens, idx) {
                const m = tokens[idx].info.trim().match(RE_CONTAINER);
                if (!m) return '';
                if (CONTAINER_MAP[m[1]]) {
                    return `${CONTAINER_MAP[m[1]][0]}${md.utils.escapeHtml(m[2])}\n${CONTAINER_MAP[m[1]][1]}\n${md.utils.escapeHtml(m[3])}`;
                }
                return `[${m[1]}]\n${md.utils.escapeHtml(m[2])}\n[/${m[1]}]\n${md.utils.escapeHtml(m[3])}`;
            },
        });
    }
}

global.Hydro.lib.markdown = module.exports = {
    unsafe: new Markdown(false),
    safe: new Markdown(true),
};
