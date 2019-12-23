'use strict';

class PageService {
  constructor(log, mongoose, httpStatus, errs, pageSchema, buttonSchema) {
    this.log = log;
    this.mongoose = mongoose;
    this.httpStatus = httpStatus;
    this.errs = errs;
    this.pageSchema = pageSchema;
    this.buttonSchema = buttonSchema;
  }

  async createPage(body) {
    const Pages = this.mongoose.model('Pages',this.pageSchema);
    const Buttons = this.mongoose.model('Buttons',this.buttonSchema);
    let button = new Buttons({
      text: "go back to page 1",
      linkTo: "5dfff62ec1c3e905cf6dbec7"
    })
    
    let newPage = new Pages({
      text: 'This is another page.',
      story: '5df816c4ac9a560635a56be1',
      buttons: [ button ]
    });
    newPage = await newPage.save();

    this.log.info('Page Created Successfully');
    return newPage;
  }
}

module.exports = PageService;