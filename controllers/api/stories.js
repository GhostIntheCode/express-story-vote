// models
const Story = require("../../models/story");
const { calculateVotes, calculateUniqueVotes } = require("../../helpers/vote");
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = {
  getStories: (req, res) => {
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), "gi");
      Story.find({ title: regex, status: "public" })
        .sort({ date: "desc" })
        .populate("creator")
        .then(async stories => {
          if (stories.length < 1) {
            res.render("index/search", { search: req.query.search });
          } else {
            // add Votes
            stories = await calculateVotes(stories, req.user);
            // sort by totall votes
            stories = stories.sort((s1, s2) =>
              s1.totalVotes < s2.totalVotes ? 1 : -1
            );
            return res.json({ stories });
          }
        });
    } else {
      Story.find({ status: "public" })
        .sort({ date: "desc" })
        .populate("creator")
        .then(async stories => {
          // add Votes
          stories = await calculateVotes(stories, req.user);
          // sort by totall votes
          stories = stories.sort((s1, s2) =>
            s1.totalVotes < s2.totalVotes ? 1 : -1
          );
          return res.json({ stories });
        });
    }
  },
  getStory: (req, res) => {
    Story.findOne({ _id: req.params.id })
      .populate("creator")
      .populate("comments.commentCreator")
      .then(async story => {
        if (story.status == "public") {
          // add totalVotes
          const storyWithVotes = await calculateUniqueVotes(story, req.user);
          story = storyWithVotes;
          return res.json({ story });
        } else if (req.user) {
          if (story.creator.id == req.user.id) {
            // add totalVotes
            const storyWithVotes = await calculateUniqueVotes(story, req.user);
            story = storyWithVotes;
            return res.json({ story });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      });
  },
  getStoryByUser: (req, res) => {
    Story.find({ creator: req.params.userId, status: "public" })
      .populate("creator")
      .then(async stories => {
        // add totalVotes
        const storiesWithVotes = await calculateVotes(stories, req.user);
        stories = storiesWithVotes;
        // sort by totall votes
        stories = stories.sort((s1, s2) =>
          s1.totalVotes < s2.totalVotes ? 1 : -1
        );
        res.json({ stories });
      });
  },
  getStoryByAuthUser: (req, res) => {
    Story.find({ creator: req.user.id })
      .populate("creator")
      .then(async stories => {
        // add totalVotes
        const storiesWithVotes = await calculateVotes(stories, req.user);
        stories = storiesWithVotes;
        // sort by totall votes
        stories = stories.sort((s1, s2) =>
          s1.totalVotes < s2.totalVotes ? 1 : -1
        );
        res.json({ stories });
      });
  }
};
