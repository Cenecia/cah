'use strict';

class StoryController {
  constructor(log, storyService, httpStatus) {
    this.log = log;
    this.storyService = storyService;
    this.httpStatus = httpStatus;
  }

  async create(req, res) {
    try {
      const {body} = req;
      const result = await this.storyService.createStory(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
  
  async remove(req, res) {
    try {
      const {body} = req;
      const result = await this.storyService.removeStory(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
  
  async edit(req, res) {
    try {
      const {body} = req;
      const result = await this.storyService.editStory(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
}

module.exports = StoryController;
