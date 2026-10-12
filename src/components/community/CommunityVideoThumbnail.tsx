import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import styles from '../../styles/community';

interface CommunityVideoThumbnailProps {
  uri: string;
  token: string;
}

/** Loads a paused video at time zero so the grid can show its opening frame. */
function CommunityVideoThumbnail({ uri, token }: CommunityVideoThumbnailProps) {
  const player = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);

  return (
    <View style={styles.videoThumbnail}>
      <Video
        ref={player}
        source={{ uri, headers: { Authorization: `Bearer ${token}` } }}
        style={styles.gridImage}
        resizeMode="cover"
        paused={paused}
        muted
        repeat={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
        onReadyForDisplay={() => {
          player.current?.seek(0);
          setPaused(true);
        }}
      />
      <View pointerEvents="none" style={styles.videoThumbnailBadge}>
        <Text style={styles.videoThumbnailGlyph}>▶</Text>
      </View>
    </View>
  );
}

export default CommunityVideoThumbnail;
