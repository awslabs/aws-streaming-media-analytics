export var Utils = function() {

  this.getSegmentInfo = function(player) {
    let segmentDuration = player.tech_.hls.playlists.media_.targetDuration;
    let segmentIndex = Math.floor(player.currentTime() / segmentDuration);
    // console.log("In timeupdate.segmentCount ",segmentIndex);
    let segmentInfo = player.tech_.hls.playlists.media_.segments[segmentIndex];
    return segmentInfo;
  };

  this.getPackageType = function(player) {
    return player.tech_.hls.masterPlaylistController_.sourceType_;
  };

  this.getPlaylistType = function(player) {
    console.log("In getPlaylistType :", player);
    try {
      return player.tech_.hls.playlists.media_.playlistType;
    } catch (e) {
      return "LIVE";
    }
  };
  return this;
};
