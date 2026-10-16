import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import styles from '../../styles/community';

interface CommunityVideoPlayerProps {
  uri: string;
  token?: string;
  autoPlay?: boolean;
  controls?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'none';
}

/** Visible feed videos autoplay and stop after three complete plays. */
function CommunityVideoPlayer({
  uri,
  token,
  autoPlay = false,
  controls = false,
  resizeMode = 'cover',
}: CommunityVideoPlayerProps) {
  const player = useRef<VideoRef>(null);
  const completedPlays = useRef(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [exhausted, setExhausted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasDisplayedFirstFrame, setHasDisplayedFirstFrame] = useState(false);

  useEffect(() => {
    completedPlays.current = 0;
    setExhausted(false);
    setPlaying(autoPlay);
    setIsBuffering(false);
    setHasDisplayedFirstFrame(false);
  }, [autoPlay, uri]);

  const handleEnd = () => {
    completedPlays.current += 1;
    if (completedPlays.current >= 3) {
      setPlaying(false);
      setExhausted(true);
      return;
    }

    player.current?.seek(0);
    setPlaying(false);
    requestAnimationFrame(() => setPlaying(true));
  };

  const handlePlaybackPress = () => {
    if (exhausted) {
      completedPlays.current = 0;
      player.current?.seek(0);
      setExhausted(false);
      setPlaying(true);
      return;
    }
    setPlaying(value => !value);
  };

  return (
    <View style={styles.videoPlayerContainer}>
      <Video
        ref={player}
        source={{
          uri,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }}
        style={styles.videoPlayer}
        resizeMode={resizeMode}
        paused={!playing}
        muted={!controls}
        repeat={false}
        controls={controls}
        renderLoader={
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        }
        playInBackground={false}
        playWhenInactive={false}
        onEnd={handleEnd}
        onBuffer={({ isBuffering: buffering }) => setIsBuffering(buffering)}
        onReadyForDisplay={() => {
          setHasDisplayedFirstFrame(true);
          setIsBuffering(false);
        }}
        onError={() => {
          setPlaying(false);
          setIsBuffering(false);
        }}
      />
      {hasDisplayedFirstFrame && isBuffering && (
        <View pointerEvents="none" style={styles.videoLoadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {!controls && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            exhausted
              ? '동영상 처음부터 재생'
              : playing
              ? '동영상 일시정지'
              : '동영상 재생'
          }
          style={styles.videoPlayerTouchArea}
          onPress={handlePlaybackPress}
        >
          {(!playing || exhausted) && (
            <View style={styles.videoPlayerPlayButton}>
              <Text style={styles.videoPlayGlyph}>{exhausted ? '↻' : '▶'}</Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

export default CommunityVideoPlayer;
