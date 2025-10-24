import { getPages } from "../lib/utils.js";

/**
 * Инициализация пагинации.
 *
 * @param {Object} elements - ссылки на DOM-элементы пагинатора
 * @param {HTMLElement} elements.pages - контейнер для кнопок страниц
 * @param {HTMLElement} elements.fromRow - узел для вывода номера первой строки
 * @param {HTMLElement} elements.toRow - узел для вывода номера последней строки
 * @param {HTMLElement} elements.totalRows - узел для вывода общего количества строк
 * @param {Function} createPage - фабрика разметки для одной кнопки страницы
 * @returns {{ applyPagination: Function, updatePagination: Function }}
 */
export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage
) => {
  // Берём первый дочерний элемент как шаблон кнопки страницы и очищаем контейнер
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  // Храним количество страниц, чтобы корректно обрабатывать next/last
  let pageCount;

  /**
   * Собирает параметры пагинации (limit/page) в query-объект.
   * Вызывается ДО запроса на сервер.
   *
   * @param {Object} query - текущие query-параметры
   * @param {Object} state - состояние формы (rowsPerPage, page и т.п.)
   * @param {HTMLElement?} action - элемент, вызвавший действие (prev/next/first/last)
   * @returns {Object} новый query c { limit, page }
   */
  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
    let page = state.page;

    // Обрабатываем «кнопочные» события пагинации.
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

    // Возвращаем новый объект (не мутируем исходный query)
    return Object.assign({}, query, { limit, page });
  };

  /**
   * Перерисовывает UI пагинации на основе ответа сервера.
   * Вызывается ПОСЛЕ получения { total, items }.
   *
   * @param {number} total - общее количество строк (с учётом фильтров/поиска)
   * @param {{page:number, limit:number}} params - текущая страница и лимит
   */
  const updatePagination = (total, { page, limit }) => {
    // 1) Пересчитываем количество страниц
    pageCount = Math.ceil(total / limit);

    // 2) Строим список видимых кнопок страниц (например, максимум 5)
    const visiblePages = getPages(page, pageCount, 5);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        return createPage(el, pageNumber, pageNumber === page);
      })
    );

    // 3) Обновляем текстовые индикаторы диапазона и общего числа строк
    fromRow.textContent = (page - 1) * limit + 1;      // первый элемент на текущей странице
    toRow.textContent = Math.min(page * limit, total); // последний элемент (учитывая последнюю страницу)
    totalRows.textContent = total;                     // всего найдено строк
  };

  return {
    updatePagination,
    applyPagination,
  };
};
