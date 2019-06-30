function sendVote(storyId, previousVoteValue, direction) {
  const upVoteAttribute = document.getElementById(`upVote-${storyId}`);
  const downVoteAttribute = document.getElementById(`downVote-${storyId}`);
  const totalVoteText = document.getElementById(`totalVotes-${storyId}`);
  const dataKey = totalVoteText.getAttribute("data-key");

  // send fetch request with it : /Vote/:storyId/:vote
  fetch(`/stories/${direction}/${storyId}/${previousVoteValue}`, {
    method: "POST"
  })
    .then(result => {
      return result.json();
    })
    .then(response => {
      // check response and update dom based on it
      // [X] change previous vote value up and down  :
      const newVoteValue = response.vote.direction;
      // [X] count, update new total vote and [X] toggle colors
      let voteNum = 0;
      if (direction == "upVote") {
        const clickfun = upVoteAttribute.getAttribute("onclick");
        const funname = clickfun.substring(0, clickfun.indexOf("("));
        upVoteAttribute.setAttribute(
          "onclick",
          funname + `('${storyId}',${newVoteValue},'${direction}')`
        );
        downVoteAttribute.setAttribute(
          "onclick",
          funname + `('${storyId}',${newVoteValue},'downVote')`
        );
        if (dataKey == "down") {
          voteNum = 2;
          totalVoteText.setAttribute("data-key", "up");
        } else {
          voteNum = previousVoteValue == 1 ? -1 : 1;
          if (voteNum == 1) {
            totalVoteText.setAttribute("data-key", "up");
          } else {
            totalVoteText.setAttribute("data-key", "");
          }
        }
        // toggle color
        upVoteAttribute.classList.toggle("purple-text");
        upVoteAttribute.classList.toggle("black-text");
        downVoteAttribute.classList.add("black-text");
        downVoteAttribute.classList.remove("red-text");
      } else if (direction == "downVote") {
        const clickfun = downVoteAttribute.getAttribute("onclick");
        const funname = clickfun.substring(0, clickfun.indexOf("("));
        upVoteAttribute.setAttribute(
          "onclick",
          funname + `('${storyId}',${newVoteValue},'upVote')`
        );
        downVoteAttribute.setAttribute(
          "onclick",
          funname + `('${storyId}',${newVoteValue},'${direction}')`
        );
        if (dataKey == "up") {
          voteNum = -2;
          totalVoteText.setAttribute("data-key", "down");
        } else {
          voteNum = previousVoteValue == -1 ? 1 : -1;
          if (voteNum == -1) {
            totalVoteText.setAttribute("data-key", "down");
          } else {
            totalVoteText.setAttribute("data-key", "");
          }
        }
        // toggle color
        downVoteAttribute.classList.toggle("black-text");
        downVoteAttribute.classList.toggle("red-text");
        upVoteAttribute.classList.remove("purple-text");
        upVoteAttribute.classList.add("black-text");
      }
      // [X]update total votes
      let totalVote = parseInt(totalVoteText.innerText);
      totalVoteText.innerText = totalVote += voteNum;
    });
}
