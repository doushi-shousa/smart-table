export function initFiltering(elements) {
  /**
   * Заполняет выпадающие списки (например, список продавцов)
   * значениями, полученными с сервера.
   *
   * @param {Object} elements - элементы фильтра в таблице
   * @param {Object} indexes - объект индексов { searchBySeller: {...}, ... }
   */
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      elements[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const option = document.createElement("option");
          option.textContent = name;
          option.value = name;
          return option;
        })
      );
    });
  };

  /**
   * Формирует параметры фильтрации и добавляет их в query-объект.
   * Также обрабатывает очистку полей фильтра.
   *
   * @param {Object} query - текущие параметры запроса
   * @param {Object} state - состояние всех полей таблицы
   * @param {HTMLElement?} action - элемент, вызвавший действие (например, кнопка очистки)
   * @returns {Object} обновлённый query с параметрами фильтрации
   */
  const applyFiltering = (query, state, action) => {
    // 🔹 Обработка кнопки «очистить поле»
    if (action?.name === "clear") {
      const filterField = action.parentElement.querySelector("input");
      if (filterField) filterField.value = "";
    }

    // 🔹 Собираем непустые значения фильтров в объект filter
    const filter = {};
    Object.keys(elements).forEach((key) => {
      const el = elements[key];
      if (el && ["INPUT", "SELECT"].includes(el.tagName) && el.value) {
        // Каждое поле добавляем в query с префиксом filter[...]
        filter[`filter[${el.name}]`] = el.value;
      }
    });

    // 🔹 Если фильтры есть — добавляем их в query; если нет — возвращаем исходный объект
    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  // Возвращаем функции для дальнейшего использования в main.js
  return {
    updateIndexes,
    applyFiltering,
  };
}