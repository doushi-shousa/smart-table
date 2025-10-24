import { sortMap } from "../lib/sort.js";

/**
 * Инициализация сортировки по столбцам таблицы.
 *
 * @param {HTMLElement[]} columns - массив кнопок сортировки (каждая хранит dataset.field и dataset.value)
 * @returns {Function} функция, добавляющая параметр сортировки в query-объект
 */
export function initSorting(columns) {
  /**
   * Обрабатывает действие сортировки и добавляет параметр `sort` в запрос.
   *
   * @param {Object} query - текущие параметры запроса
   * @param {Object} state - состояние таблицы (используется для унификации сигнатуры)
   * @param {HTMLElement?} action - элемент, вызвавший действие (кнопка сортировки)
   * @returns {Object} обновлённый query с параметром `sort`, если сортировка активна
   */
  return (query, state, action) => {
    let field = null;
    let order = null;

    // 🔹 Если кликнули по кнопке сортировки — переключаем состояние
    if (action && action.name === "sort") {
      // Переключаем состояние кнопки согласно карте sortMap (например: none → asc → desc → none)
      action.dataset.value = sortMap[action.dataset.value];

      // Определяем поле и направление сортировки из нажатой кнопки
      field = action.dataset.field;
      order = action.dataset.value;

      // Сбрасываем состояние сортировки у остальных столбцов
      columns.forEach((column) => {
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = "none";
        }
      });
    } else {
      // 🔹 Если сортировка не менялась, ищем активную колонку
      columns.forEach((column) => {
        if (column.dataset.value !== "none") {
          field = column.dataset.field;
          order = column.dataset.value;
        }
      });
    }

    // 🔹 Формируем строку вида "field:direction", если сортировка активна
    const sort = field && order !== "none" ? `${field}:${order}` : null;

    // 🔹 Добавляем параметр sort в query или возвращаем исходный объект без изменений
    return sort ? Object.assign({}, query, { sort }) : query;
  };
}
