'use strict';

class StoryService {
  constructor(log, mongoose, httpStatus, errs, storySchema) {
    this.log = log;
    this.mongoose = mongoose;
    this.httpStatus = httpStatus;
    this.errs = errs;
    this.storySchema = storySchema;
  }

  async createStory(body) {
    const Stories = this.mongoose.model('Stories',this.storySchema);
    let newStory = new Stories({
      title: body.title,
      owner: body.owner
    });
    newStory = await newStory.save();

    this.log.info('Story Created Successfully');
    return newStory;
  }
  
  async removeStory(body) {
    const Stories = this.mongoose.model('Stories',this.storySchema);
    const {_id} = body;
    const story = await Stories.findOne({_id});

    if (!story) {
      const err = new this.errs.InvalidArgumentError(
        'Story does not exist'
      );
      return err;
    }
    
    this.log.info('Story fetched Successfully');
    await Stories.deleteOne({_id});
    this.log.info('Story deleted Successfully');
    return "removed story";
  }
  
  async editStory(body) {
    const Stories = this.mongoose.model('Stories',this.storySchema);
    const {_id, title} = body;
    let story = await Stories.findOne({_id});

    if (!story) {
      const err = new this.errs.InvalidArgumentError(
        'Story does not exist'
      );
      return err;
    }
    
    this.log.info('Story fetched Successfully');
    story.title = title;
    await story.save();
    this.log.info('Story saved Successfully');
    story = await Stories.findOne({_id});
    return story;
  }
}

module.exports = StoryService;