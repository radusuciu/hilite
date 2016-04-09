import getTextNodes from './getTextNodes.js'

export default class Highlighter {
    constructor(el = document.body) {
        this.el = el;
        this.highlights = [];
    }

    /**
     * Add highlight with this Highlighter object 
     * @param {number} start   Start offset to begin highlight
     * @param {number} end     End offset to end highlight. Default to start + 1
     * @param {object|string} styles  Styles to apply with highlight. Can be
     * hash of styles or a class name to apply
     * @param {object} options Hash of additional options to use
     */
    add(start = 0, end = start + 1, styles, options = {}) {
        if (end > start && start >= 0) {
            this.highlights.push(
                new Highlight(this.el, start, end, styles, options)
            );
        }

        return this;
    }

    /**
     * Removes a set of highlights
     * @param  {array|Highlight} highlights Individual or array of Highlight
     * objects to remove. Removes all highlights for this Highlighter object
     * when ommitted
     * @return {Highlighter}            Return Highlighter object for chaining.
     */
    remove(highlights = this.highlights) {
        // support removal of individual highlights
        if (!highlights.length) highlights = [ highlights ];

        for (let i = 0, n = highlights.length; i < n; i ++) {
            let index = this.highlights.indexOf(highlights[i]);
            highlights[i].remove();
            this.highlights.splice(index, 1);
        }

        return this;
    }
}

class Highlight {
    constructor(parent, start, end, styles, options = {}) {
        this.els = [];

        this.start = start;
        this.end = end;
        this.styles = styles;
        this.options = options;

        if (typeof this.styles === 'string') {
            this.options.cssClass = this.styles;
            this.styles = {};
        }

        this.tag = 'span';
        this.parent = parent;

        this.apply();
    }

    /**
     * Apply highlight to nodes
     */
    apply() {
        const nodes = getNodesInRange(this.parent, this.start, this.end);
        let wrap = document.createElement(this.tag);

        addClass(wrap, this.options.cssClass);  
        setStyles(wrap, this.styles);

        for (let node of nodes) {
            let el = wrap.cloneNode();
            el.appendChild(node.cloneNode());
            node.parentNode.insertBefore(el, node);
            node.parentNode.removeChild(node);
            this.els.push(el);
        }
    }

    /**
     * Remove highlight from nodes
     */
    remove() {
        for (let node of this.els) unwrap(node);
        this.els = null;
        // rejoin adjacent text nodes
        this.parent.normalize();
    }
}

/**
 * Remove all wrapping elements for a given node
 * @param  {DOMElement} el Element to unwrap
 */
function unwrap(el) {
    while (el.hasChildNodes()) {
        el.parentNode.insertBefore(el.childNodes[0], el);
    }

    el.parentNode.removeChild(el);
}

/**
 * Apply styles to DOMElement
 * @param {DOMElement} el     Element to apply styles to
 * @param {Object} styles Hash of styles to apply to element
 */
function setStyles(el, styles) {
    for (let prop in styles) {
        if (styles.hasOwnProperty(prop)) {
            el.style[prop] = styles[prop];
        }
    }
}

/**
 * Adds class to element
 * @param {DOMElement} el  Element to add class to
 * @param {string} cls Class to add
 */
function addClass(el, cls) {
    if (cls) {
        if (el.className) cls = ' ' + cls;
        el.className += cls;
    }
}

/**
 * Get all text nodes that overlap with given start and end values
 * @param  {DOMElement} container Element to get nodes from
 * @param  {number} start     Start offset
 * @param  {number} end       End offset
 * @return {array}           List of nodes
 */
function getNodesInRange(container, start, end) {
    const nodes = getTextNodes(container);
    let length = 0;
    let prevLength = 0;
    let nodesInRange = [];

    for (let node of nodes) {
        prevLength = length;
        length += node.length;

        // only start adding nodes once we've caught up in length
        if (start < length) {
            // if start is greater than current length, but less than previous
            // then the start must be within the current node, and we can split
            // the node here - except if we are right on the border which makes
            // splitting unnecessary
            if (start > prevLength && start !== prevLength) {
                node = node.splitText(start - prevLength);
                // since we've split the node, our previous length becomes the
                // start of the new node
                prevLength = start;
            }
        } else {
            continue;
        }

        // once we've added enough nodes that we have passed the end offset we
        // can add the last node, splitting if necessary and break out
        if (end <= length) {
            // split last node if necessary
            if (end !== length) {
                node.splitText(end - prevLength);
            }

            // make sure to add last node
            nodesInRange.push(node);

            break;
        } else {
            nodesInRange.push(node);
        }
    }

    return nodesInRange;
}