import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// Инициализируем «API-обёртку»: наружу отдаём getIndexes/getRecords.
// sourceData остаётся для совместимости со стартером, но фактически работаем с сервером.
const api = initData(sourceData);

/**
 * Снимаем текущее состояние UI (формы таблицы) и приводим к нужным типам.
 * Возвращаем один объект, с которым дальше будут работать все apply*.
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  // Количество строк и номер страницы всегда числа
  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);

  return {
    ...state,
    rowsPerPage,
    page,
  };
}

/**
 * Единая точка перерисовки таблицы.
 * 1) Собираем состояние.
 * 2) По очереди «наращиваем» query из компонентов (search/filter/sort/pagination).
 * 3) Запрашиваем данные у сервера.
 * 4) Обновляем пагинацию и рендерим строки.
 *
 * Важно: порядок apply* влияет на итоговый запрос.
 */
async function render(action) {
  const state = collectState();
  let query = {};

  // Порядок — осознанный: фильтрация/поиск/сортировка/пагинация формируют query.
  query = applyPagination(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySearching(query, state, action);
  query = applySorting(query, state, action);

  // Получаем { total, items } с учётом собранных параметров
  const { total, items } = await api.getRecords(query);

  // Обновляем UI пагинации на основании total/limit/page
  updatePagination(total, query);

  // Рендерим строки таблицы
  sampleTable.render(items);
}

// Создаём таблицу и указываем, какие секции идут до/после основной разметки.
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render // колбэк для ре-рендера при взаимодействиях
);

// ---------- Инициализация компонентов ----------

// Пагинация: отдаёт две функции — сбор параметров (apply) и перерисовку (update).
const { applyPagination, updatePagination } = initPagination(
  // Узлы пагинатора, найденные внутри таблицы
  sampleTable.pagination.elements,
  // Колбэк для подписывания кнопок страниц (value/checked/label)
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  }
);

// Сортировка: передаём контролы, по клику на которых меняется поле/направление.
const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

// Фильтрация: нужна пара функций — заполнить индексы (продавцы) и собрать filter[...] в query.
const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements
);

// Поиск: возвращает функцию, которая при наличии строки добавляет search в query.
const applySearching = initSearching("search");

// Монтируем таблицу в DOM
const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

/**
 * Стартовая инициализация:
 * 1) Загружаем справочники (индексы) с сервера.
 * 2) Наполняем селекты фильтра (например, продавцов).
 * 3) Делаем первоначальный рендер.
 */
async function init() {
  const indexes = await api.getIndexes();

  updateIndexes(sampleTable.filter.elements, {
    // Ключ -> имя элемента формы; значение -> объект индекса
    searchBySeller: indexes.sellers,
  });
}

// Первый рендер выполняем после инициализации индексов,
// чтобы селекты и таблица сразу были согласованы.
init().then(render);
