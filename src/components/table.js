import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализация таблицы и делегирование UI-событий.
 *
 * @param {Object} settings
 * @param {string} settings.tableTemplate - имя шаблона таблицы
 * @param {string} settings.rowTemplate - имя шаблона строки
 * @param {string[]} settings.before - имена подшаблонов, которые нужно вставить ПЕРЕД таблицей (в указанном порядке)
 * @param {string[]} settings.after - имена подшаблонов, которые нужно вставить ПОСЛЕ таблицы (в указанном порядке)
 * @param {(action?: HTMLButtonElement) => void} onAction - колбэк, вызывается при изменениях формы/кнопках
 * @returns {{ container: Node, elements: *, render: (data: Array<Object>) => void }}
 */
export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;

  // Корневой шаблон таблицы: ожидаем объект вида { container, elements, ... }
  const root = cloneTemplate(tableTemplate);

  // Вставляем доп. секции ПЕРЕД таблицей.
  // Превращаем prepend в «сохранение порядка»: начинаем с последнего (reverse), чтобы визуально порядок совпадал с исходным массивом.
  before.reverse().forEach((subName) => {
    root[subName] = cloneTemplate(subName);
    root.container.prepend(root[subName].container);
  });

  // Вставляем доп. секции ПОСЛЕ таблицы по порядку.
  after.forEach((subName) => {
    root[subName] = cloneTemplate(subName);
    root.container.append(root[subName].container);
  });

  // ---- События формы/кнопок (единая точка входа для действий пользователя) ----

  // Любое изменение входных данных (select, input, radio...) — перерисовываем.
  root.container.addEventListener("change", () => {
    onAction();
  });

  // Сброс формы: даём браузеру применить сброс (tick) и затем перерисовываем.
  root.container.addEventListener("reset", () => {
    setTimeout(onAction); // важно вызвать после нативного reset, чтобы state был уже «очищен»
  });

  // Сабмит: предотвращаем перезагрузку, пробрасываем кнопку-инициатор как action.
  root.container.addEventListener("submit", (e) => {
    e.preventDefault();
    onAction(e.submitter);
  });

  /**
   * Рендер строк таблицы.
   * Проходит по массиву данных и для каждой записи клонирует шаблон строки,
   * подставляя значения по совпадающим ключам.
   *
   * @param {Array<Object>} data - элементы для отображения (после запроса к API)
   */
  const render = (data) => {
    // Превращаем данные в DOM-узлы строк на основе rowTemplate
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);

      // Подставляем значения по ключам, если в шаблоне есть соответствующий элемент
      Object.keys(item).forEach((key) => {
        if (row.elements[key]) {
          row.elements[key].textContent = item[key];
        }
      });

      return row.container;
    });

    // Меняем все строки одним батчем — быстрее и чище
    root.elements.rows.replaceChildren(...nextRows);
  };

  // Возвращаем контейнер, полезные элементы и функцию рендера
  return { ...root, render };
}
