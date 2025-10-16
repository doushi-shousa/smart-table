import {
    getPages
} from "../lib/utils.js";

export const initPagination = ({
        pages,
        fromRow,
        toRow,
        totalRows
    },
    createPage
) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.replaceChildren();

    let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // переносим код, который делали под @todo: #2.6
        if (action) {
            switch (action.name) {
                case "prev":
                    page = Math.max(1, page - 1);
                    break;
                case "next":
                    page = Math.min(pageCount, page + 1);
                    break;
                case "first":
                    page = 1;
                    break;
                case "last":
                    page = pageCount;
                    break;
            }
        }

        return Object.assign({}, query, { // добавим параметры к query, но не изменяем исходный объект
            limit,
            page,
        });
    };

    const updatePagination = (total, {
        page,
        limit
    }) => {
        pageCount = Math.ceil(total / limit);

        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(
            ...visiblePages.map((pageNumber) =>
                createPage(
                    pageTemplate.cloneNode(true),
                    pageNumber,
                    pageNumber === page
                )
            )
        );

        const skip = (page - 1) * limit;
        fromRow.textContent = skip + 1;
        toRow.textContent = Math.min(skip + limit, total);
        totalRows.textContent = total;
    };

    return {
        updatePagination,
        applyPagination,
    };
};