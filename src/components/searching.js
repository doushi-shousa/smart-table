/**
 * Инициализация поиска по таблице.
 *
 * @param {string} searchField - имя поля ввода, используемого для поиска
 * @returns {Function} функция, добавляющая параметр `search` в query при его наличии
 */
export function initSearching(searchField) {
  /**
   * Добавляет параметр поиска в query-объект, если поле не пустое.
   *
   * @param {Object} query - текущие параметры запроса
   * @param {Object} state - состояние всех полей формы таблицы
   * @param {HTMLElement?} action - элемент, вызвавший действие (не используется, но оставлен для унификации сигнатуры)
   * @returns {Object} обновлённый query с параметром `search`
   */
  return (query, state, action) => {
    // 🔹 Если в поле поиска есть значение — добавляем параметр `search` в запрос
    return state[searchField]
      ? Object.assign({}, query, { search: state[searchField] })
      // 🔹 Если поле пустое — возвращаем исходный query без изменений
      : query;
  };
}
