function sendVote(storyId, previousVoteValue, direction) {
    alert(`${direction} sent to ${storyId}`)
    // send fetch request with it : /upVote/:storyId/:vote
    fetch(`/stories/${direction}/${storyId}/${previousVoteValue}`, { method: 'POST' }).then(result => {
        return result.json();
    }).then(json => {
        console.log(json);
        // check response and update dom based on it 
    })
}