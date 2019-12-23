'use strict';

class PageController {
  constructor(log, pageService, httpStatus) {
    this.log = log;
    this.pageService = pageService;
    this.httpStatus = httpStatus;
  }

  async create(req, res) {
    try {
      const {body} = req;
      const result = await this.pageService.createPage(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
}

module.exports = PageController;
