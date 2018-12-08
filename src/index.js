const { removeNonModelFields } = require('./utils');

const PAGE_QUERY_PARAMETER = process.env.PAGE_QUERY_PARAMETER || 'page';
const PAGE_SIZE_QUERY_PARAMETER = process.env.PAGE_SIZE_QUERY_PARAMETER || 'pageSize';
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20;
const MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE, 10) || 100;

class PageNumberPaginator {
  constructor(model, ctx, pageSize, sortBy, ordering = 'asc') {
    this.ctx = ctx;
    this.model = model;
    this.query = this.constructor.getModelQuery(ctx.query || {});
    this.pageSize = this.constructor.getPageSize(
      parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE
    );
    this.useDefaultPageSize = pageSize == null;
    this.sort = { [sortBy]: ordering };
  }

  static getModelQuery(query = {}) {
    const cleanedQueryParams = removeNonModelFields(query, model);
    return Object.assign({}, cleanedQueryParams);
  }

  static getPageSize(pageSize) {
    if (pageSize > MAX_PAGE_SIZE) {
      return MAX_PAGE_SIZE;
    }
    return pageSize;
  }

  static getPageNumber(pageNumber) {
    const parsedPageNumber = parseInt(pageNumber, 10);
    return parsedPageNumber === 0 ? 1 : parsedPageNumber;
  }

  static getTotalPages(count, pageSize) {
    return Math.ceil(count / pageSize);
  }

  async getPageResults(page) {
    return this.model
      .find(this.query)
      .limit(this.pageSize)
      .skip(page * this.pageSize)
      .sort(this.sort);
  }

  async count() {
    return this.model.find(this.query).count();
  }

  getPageUrl(pageNumber) {
    let pageUrl = null;

    if (pageNumber) {
      pageUrl = `${this.ctx.request.origin}${this.ctx.request.path}?${PAGE_QUERY_PARAMETER}=${pageNumber}`;
      if (!this.useDefaultPageSize) {
        pageUrl = `${pageUrl}&${PAGE_SIZE_QUERY_PARAMETER}=${this.pageSize}`;
      }
    }
    return pageUrl;
  }

  static getPreviousPageNum(pageNumber) {
    return pageNumber > 1 ? pageNumber - 1 : null;
  }

  static getNextPageNum(pageNumber, totalPages) {
    return pageNumber < totalPages ? pageNumber + 1 : null;
  }

  getPreviousPageUrl(pageNumber) {
    const previous = this.constructor.getPreviousPageNum(pageNumber);
    return this.getPageUrl(previous);
  }

  getNextPageUrl(pageNumber, totalPages) {
    const next = this.constructor.getNextPageNum(pageNumber, totalPages);
    return this.getPageUrl(next);
  }

  async get(page = 0) {
    const pageNumber = this.constructor.getPageNumber(page);
    const [results, count] = await Promise.all([
      this.getPageResults(pageNumber - 1),
      this.count(),
    ]);
    const totalPages = this.constructor.getTotalPages(count, this.pageSize);

    return {
      results,
      pagination: {
        totalPages,
        count,
        previous: this.getPreviousPageUrl(pageNumber),
        next: this.getNextPageUrl(pageNumber, totalPages),
      },
    };
  }
}

module.exports = {
  PAGE_QUERY_PARAMETER,
  PAGE_SIZE_QUERY_PARAMETER,
  PageNumberPaginator,
};
