/**
 * Get all text nodes within a given DOMElement. Lifted from Tim Down's
 * excellent rangy.js library, https://github.com/timdown/rangy.
 * @param  {DOMElement} node Parent node to get text nodes from
 * @return {array}      Array of text nodes contained in parent element
 */
export default function getTextNodes(node) {
    let nodes = [];

    for (node = node.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === 3 && !isUnrenderedWhiteSpace(node)) {
            nodes.push(node);
        } else if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            nodes = nodes.concat(getTextNodes(node));
        }
    }

    return nodes;
}

const htmlNonWhiteSpaceRegex = /[^\r\n\t\f \u200B]/;

function isUnrenderedWhiteSpace(node) {
    if (node.data.length === 0) return true;
    if (htmlNonWhiteSpaceRegex.test(node.data)) return false;
    
    let cssWhiteSpace = window.getComputedStyle(node.parentNode, 'white-space');

    switch (cssWhiteSpace) {
        case 'pre':
        case 'pre-wrap':
        case '-moz-pre-wrap':
            return false;
        case 'pre-line':
            if (/[\r\n]/.test(node.data)) {
                return false;
            }
    }

    // We now have a whitespace-only text node that may be rendered depending 
    // on its context. If it is adjacent to a non-inline element, it will not
    // be rendered. This seems to be a good enough definition.
    return isNonInlineElement(node.previousSibling) || isNonInlineElement(node.nextSibling);
}

const inlineDisplayRegex = /^inline(-block|-table)?$/i;

function isNonInlineElement(node) {
    return node && node.nodeType === 1 && !inlineDisplayRegex.test(window.getComputedStyle(node, 'display'));
}