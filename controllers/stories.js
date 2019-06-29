// models
const Story = require("../models/story");
const Vote = require("../models/vote");
const mongoose = require("mongoose");

module.exports = {
  addStory: (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    const newStory = {
      title: req.body.title,
      body: req.body.body,
      status: req.body.status,
      creator: req.user.id,
      image: url + "/img/NoImage.jpg",
    };
    if (!newStory.body) newStory.body = "to be writen soon...";
    if (!req.body.allowComments) {
      newStory.allowComments = false;
    }
    if (req.file) {
      newStory.image = url + "/stories/images/dev/" + req.file.filename;
    }
    new Story(newStory).save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  },
  editStory: (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    Story.findOne({ _id: req.params.id }).then(story => {
      // new values
      story.title = req.body.title;
      story.body = req.body.body;
      story.status = req.body.status;
      if (req.body.allowComments) {
        story.allowComments = true;
      } else {
        story.allowComments = false;
      }
      if (req.file) {
        story.image = url + "/stories/images/dev/" + req.file.filename;
      }  
      story.save().then(story => {
        res.redirect(`/stories/show/${story.id}`);
      });
    });
  },
  deleteStory: (req, res) => {
    Story.deleteOne({ _id: req.params.id }).then(story => {
      res.redirect(`/dashboard`);
    });
  },
  addComment: (req, res) => {
    Story.findOne({ _id: req.params.storyId }).then(story => {
      const newComment = {
        commentBody: req.body.commentBody,
        commentCreator: req.user.id
      };
      // add to the begining of the array
      story.comments.unshift(newComment);

      story.save().then(story => {
        res.redirect(`/stories/show/${story.id}`);
      });
    });
  },
  deleteComment: () => {
    // ! until improuving app
  },
  // External votes :
  upVoteToggle: (req, res) => {
    // toggle Vote
    let voteNum = req.params.vote == 1 ? 0 : 1;
    // find the concerned Story
    Story.findOne({ _id: req.params.storyId }).then(story => {
      // * [X] check if it's his first vote on this story
      Vote.findOne({
        storyId: story.id,
        voteCreator: req.user
      }).then(vote => {
        if (!vote) {
          // * [X] create new vote with direction and creator
          const newVote = {
            direction: voteNum,
            storyId: story.id,
            voteCreator: req.user
          };
          new Vote(newVote).save().then(vote => {
            story.votes = vote.id;
            return res.json({ message: "up vote created", vote });
          });
        } else {
          // * [X] update the vote direction
          vote.direction = voteNum;
          vote.save().then(vote => {
            return res.json({ message: "up vote updated", vote });
          });
        }
      });
    });
  },
  downVoteToggle: (req, res) => {
    //  toggle Vote
    let voteNum = req.params.vote == -1 ? 0 : -1;
    //  find the concerned Story
    Story.findOne({ _id: req.params.storyId }).then(story => {
      //  check if it's his first vote on this story
      Vote.findOne({
        storyId: story.id,
        voteCreator: req.user
      }).then(vote => {
        if (!vote) {
          //  create new vote with direction and creator
          const newVote = {
            direction: voteNum,
            storyId: story.id,
            voteCreator: req.user
          };
          new Vote(newVote).save().then(vote => {
            story.votes = vote.id;
            return res.json({ message: "down vote created", story ,vote });
          });
        } else {
          // update the vote direction
          vote.direction = voteNum;
          vote.save().then(vote => {
            return res.json({ message: "down vote updated", story, vote });
          });
        }
      });
    });
  }
};
