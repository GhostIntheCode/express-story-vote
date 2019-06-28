// models
const Story = require("../models/story");
const Vote = require("../models/vote");
const mongoose = require("mongoose");

module.exports = {
  addStory: (req, res) => {
    const newStory = {
      title: req.body.title,
      body: req.body.body,
      status: req.body.status,
      creator: req.user.id
    };
    if (!newStory.body) newStory.body = "to be writen soon...";
    if (!req.body.allowComments) {
      newStory.allowComments = false;
    }
    new Story(newStory).save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  },
  editStory: (req, res) => {
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

      story.save().then(story => {
        res.redirect(`/dashboard`);
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
    //TODO: to get rid of this delete :
    // Vote.deleteOne({ _id: "5d06953ca0260a1f2492f3b9" }).then(v => {
    //   return res.json({ message: "v:", v});
    // });
    // return

    // Vote.findOne({ _id: "5d0695a1a6039b2ac0d2f497" }).then(v => {
    //   v.storyId = "5d07ca6db1d4d829e4c32bfa";
    //   v.direction = -1;
    //   v.voteCreator = "5d0d01b7547167362c05f2fe";
    //   v.save()
    //   return res.json({ message: "vote:", v });
    // });
    // return;

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
      //   some mongoose  learning :
      //   db.inventory.find( { "vote.vote": {vote: 1 } } )
      //   db.inventory.find( { "vote.vote": {$lte: -1 } } )
      //   db.inventory.insertMany( [
      //     { item: "journal", votes: [ { vote: 1 }, { warehouse: "C", vote: -1 } ] },
      //     { item: "notebook", votes: [ { warehouse: "C", qty: 5 } ] }
      //  ]);

      // })
    });
  },
  downVoteToggle: (req, res) => {
    // * [X] toggle Vote
    let voteNum = req.params.vote == -1 ? 0 : -1;

    // * [X] find the concerned Story
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
          Vote.save(newVote).then(vote => {
            story.votes = vote.id;
            return res.json({ message: "down vote created", story ,vote });
          });
        } else {
          // * [X] update the vote direction
          vote.direction = voteNum;
          vote.save().then(vote => {
            return res.json({ message: "down vote updated", story, vote });
          });
        }
      });
    });
  },
  // intern Votes :
  upVote: (req, res) => {
    // check if update
    // Story.findOne({"votesInternal.direction": {$lte: 1 }}).then(vote => {
    // Story.findOne({"votesInternal.voteCreator": {$lte: '5d0681b72feb1b3208c57933' }}).then(vote => {
    //   console.log(vote);
    // })
    // return

    // create vote
    Story.findOne({ _id: req.params.storyId }).then(story => {
      const voteNum = req.params.vote == 1 ? 0 : 1;
      const newVote = {
        direction: voteNum,
        voteCreator: "5d0681b72feb1b3208c57961"
      };
      // add to the begining of the array
      story.votesInternal.unshift(newVote);

      story.save().then(story => {
        return res.json({ message: "up vote created", story, newVote });
        // res.redirect(`/stories/show/${story.id}`);
      });
    });
  }
};
