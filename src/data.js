import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData(sourceData) {
  // Кэшируем базовые данные, чтобы не перегружать сервер одинаковыми запросами
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  // Преобразует полученные записи из API в формат, используемый таблицей
  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  // Загружает справочники продавцов и покупателей (индексы)
  const getIndexes = async () => {
    // Если данные ещё не загружены — отправляем запросы параллельно
    if (!sellers || !customers) {
      [sellers, customers] = await Promise.all([
        fetch(`${BASE_URL}/sellers`).then((res) => res.json()),
        fetch(`${BASE_URL}/customers`).then((res) => res.json()),
      ]);
    }

    // Возвращаем индексы для заполнения фильтров и маппинга записей
    return { sellers, customers };
  };

  // Загружает записи о продажах по параметрам запроса
  const getRecords = async (query, isUpdated = false) => {
    // Формируем query-строку из объекта параметров
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    // Проверяем, совпадает ли текущий запрос с предыдущим
    // Если совпадает и не требуется обновление — возвращаем данные из кэша
    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    // Если параметры изменились — запрашиваем новые данные с сервера
    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);

    // Преобразуем ответ в JSON (включает total и items)
    const records = await response.json();

    // Сохраняем параметры запроса и результат для последующих обращений
    lastQuery = nextQuery;
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    //Возвращаем итоговый объект в формате { total, items }
    return lastResult;
  };

  // Экспортируем API для использования в main.js
  return {
    getIndexes,
    getRecords,
  };
}
