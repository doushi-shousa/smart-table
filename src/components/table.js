import {
    cloneTemplate
} from "../lib/utils.js";

export function initTable(settings, onAction) {
    const {
        tableTemplate,
        rowTemplate,
        before,
        after
    } = settings;
    const root = cloneTemplate(tableTemplate);

    before
        .slice()
        .reverse()
        .forEach((subName) => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });

    after.forEach((subName) => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    root.container.addEventListener("change", onAction);
    root.container.addEventListener("reset", () => setTimeout(() => onAction()));
    root.container.addEventListener("submit", (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        const nextRows = data.map((item) => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach((key) => {
                if (row.elements[key]) {
                    const el = row.elements[key];
                    if (el.tagName === "INPUT" || el.tagName === "SELECT") {
                        el.value = item[key];
                    } else {
                        el.textContent = item[key];
                    }
                }
            });
            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    };

    return {
        ...root,
        render
    };
}
