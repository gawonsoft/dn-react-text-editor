import { Schema } from "prosemirror-model";
import { addListNodes } from "prosemirror-schema-list";

export function createSchema() {
    const customSchema = new Schema({
        nodes: {
            doc: { content: "block+" },
            paragraph: {
                attrs: { align: { default: null } },
                content: "inline*",
                group: "block",
                parseDOM: [
                    {
                        tag: "p",
                        getAttrs(dom) {
                            return {
                                align: dom.style.textAlign || null,
                            };
                        },
                    },
                ],
                toDOM(node) {
                    return [
                        "p",
                        {
                            style: node.attrs.align
                                ? `text-align: ${node.attrs.align}`
                                : null,
                        },
                        0,
                    ];
                },
            },
            text: {
                group: "inline",
            },
            hard_break: {
                inline: true,
                group: "inline",
                selectable: false,
                parseDOM: [{ tag: "br" }],
                toDOM() {
                    return ["br"];
                },
            },
            heading: {
                attrs: { level: { default: 1 }, align: { default: null } },
                content: "inline*",
                group: "block",
                defining: true,
                parseDOM: [
                    {
                        tag: "h1",
                        getAttrs(node) {
                            return {
                                level: 1,
                                algin: node.style.textAlign || null,
                            };
                        },
                    },
                    {
                        tag: "h2",
                        getAttrs(node) {
                            return {
                                level: 2,
                                algin: node.style.textAlign || null,
                            };
                        },
                    },
                    {
                        tag: "h3",
                        getAttrs(node) {
                            return {
                                level: 3,
                                algin: node.style.textAlign || null,
                            };
                        },
                    },
                    {
                        tag: "h4",
                        getAttrs(node) {
                            return {
                                level: 4,
                                algin: node.style.textAlign || null,
                            };
                        },
                    },
                    {
                        tag: "h5",
                        getAttrs(node) {
                            return {
                                level: 5,
                                algin: node.style.textAlign || null,
                            };
                        },
                    },
                    {
                        tag: "h6",
                        getAttrs(node) {
                            return {
                                level: 6,
                                algin: node.style.textAlign || null,
                            };
                        },
                    },
                ],
                toDOM(node) {
                    return [
                        "h" + node.attrs.level,
                        {
                            id: node.textContent
                                .toLowerCase()
                                .replace(/\s+/g, "-"),
                            style: node.attrs.align
                                ? `text-align: ${node.attrs.align};`
                                : null,
                        },
                        0,
                    ];
                },
            },
            horizontal_rule: {
                group: "block",
                parseDOM: [{ tag: "hr" }],
                toDOM() {
                    return ["hr"];
                },
            },
            image: {
                attrs: {
                    src: { validate: "string" },
                    alt: { default: null, validate: "string|null" },
                    title: {
                        default: null,
                        validate: "string|null",
                    },
                    width: {
                        default: null,
                        validate: "number|null",
                    },
                    height: {
                        default: null,
                        validate: "number|null",
                    },
                },
                inline: false,
                group: "block",
                draggable: true,
                parseDOM: [
                    {
                        tag: "img",
                        getAttrs(dom: HTMLElement) {
                            return {
                                src: dom.getAttribute("src"),
                                alt: dom.getAttribute("alt"),
                                width: dom.getAttribute("width"),
                                height: dom.getAttribute("height"),
                            };
                        },
                    },
                ],
                toDOM(node) {
                    const { src, alt, srcSet, sizes, width, height } =
                        node.attrs;

                    return [
                        "img",
                        {
                            src,
                            alt,
                            srcSet,
                            sizes,
                            width,
                            height,
                        },
                    ];
                },
            },
        },
        marks: {
            link: {
                attrs: {
                    href: { default: "" },
                    title: { default: null },
                },
                inclusive: false,
                parseDOM: [
                    {
                        tag: "a[href]",
                        getAttrs(dom) {
                            return {
                                href: dom.getAttribute("href"),
                                title: dom.getAttribute("title"),
                            };
                        },
                    },
                ],
                toDOM(node) {
                    const { href, title } = node.attrs;

                    const target = "_blank";

                    const rel = "noopener noreferrer";

                    return [
                        "a",
                        { href, title: title || href, target, rel },
                        0,
                    ];
                },
            },
            bold: {
                parseDOM: [
                    { tag: "strong" },
                    {
                        tag: "b",
                        getAttrs: (node) =>
                            node.style.fontWeight != "normal" && null,
                    },
                    {
                        style: "font-weight=400",
                        clearMark: (m) => m.type.name == "strong",
                    },
                    {
                        style: "font-weight",
                        getAttrs: (value: string) =>
                            /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
                    },
                ],
                toDOM() {
                    return ["strong", 0];
                },
            },
            italic: {
                parseDOM: [
                    { tag: "em" },
                    { tag: "i" },
                    { style: "font-style=italic" },
                    {
                        style: "font-style=normal",
                        clearMark: (m) => m.type.name == "em",
                    },
                ],
                toDOM() {
                    return ["em", 0];
                },
            },
            underline: {
                parseDOM: [
                    { tag: "u" },
                    {
                        style: "text-decoration",
                        getAttrs: (value) => value === "underline" && null,
                    },
                ],
                toDOM() {
                    return ["u", 0];
                },
            },
        },
    });

    const prosemirrorSchema = new Schema({
        nodes: addListNodes(
            customSchema.spec.nodes,
            "paragraph block*",
            "block"
        ),
        marks: customSchema.spec.marks,
    });

    return prosemirrorSchema;
}
