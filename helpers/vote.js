// models
const Vote = require("../models/vote");

// checks if current user voted and calculates tottal votes
module.exports = {
  calculateUniqueVotes: async (story, user) => {
    // TODO : to be continue
    const newStory = { ...story._doc };
    if (user) {
      newStory.currentUserVoted = false;
      newStory.currentUserDirection = 0;
      // for handlebars {
      newStory.currentUserVotedUp = false;
      newStory.currentUserVotedDown = false;
      // }
      await Vote.findOne({ storyId: story.id, voteCreator: user }).then(
        async vote => {
          if (vote) {
            newStory.currentUserVoted = true;
            newStory.currentUserDirection = vote.direction;
            // for handlebars :
            if (vote.direction > 0) newStory.currentUserVotedUp = true;
            if (vote.direction < 0) newStory.currentUserVotedDown = true;
          }
        }
      );
    }
    newStory.totalVotes = 0;
    newStory.totalUpVotes = 0;
    newStory.totalDownVotes = 0;
    await Vote.find({ storyId: story.id }).then(async votes => {
      if (votes.length > 0) {
        await votes.forEach(async vote => {
          if (vote.direction < 0) {
            newStory.totalDownVotes += vote.direction;
          }
          if (vote.direction > 0) {
            newStory.totalUpVotes += vote.direction;
          }
          newStory.totalVotes += vote.direction;
        });
      }
    });
    return newStory;
  },
  calculateVotes: async (stories, user) => {
    let storyTotalVotes = [];
    for (const story of stories) {
      const newStory = { ...story._doc };
      if (user) {
        newStory.currentUserVoted = false;
        newStory.currentUserDirection = 0;
        // for handlebars {
        newStory.currentUserVotedUp = false;
        newStory.currentUserVotedDown = false;
        // }
        await Vote.findOne({ storyId: story.id, voteCreator: user }).then(
          async vote => {
            if (vote) {
              newStory.currentUserVoted = true;
              newStory.currentUserDirection = vote.direction;
              // for handlebars :
              if (vote.direction > 0) newStory.currentUserVotedUp = true;
              if (vote.direction < 0) newStory.currentUserVotedDown = true;
            }
          }
        );
      }
      newStory.totalVotes = 0;
      newStory.totalUpVotes = 0;
      newStory.totalDownVotes = 0;
      await Vote.find({ storyId: story.id }).then(async votes => {
        if (votes.length > 0) {
          await votes.forEach(async vote => {
            if (vote.direction < 0) {
              newStory.totalDownVotes += vote.direction;
            }
            if (vote.direction > 0) {
              newStory.totalUpVotes += vote.direction;
            }
            newStory.totalVotes += vote.direction;
          });
        }
      });
      storyTotalVotes.push(newStory);
    }
    return storyTotalVotes;
  }
};
