package com.mihrabnoor.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import java.lang.ref.WeakReference;

public class MediaPlaybackService extends Service {

    public static final String CHANNEL_ID = "mihrab_media_playback";
    public static final int NOTIFICATION_ID = 4041;

    public static final String ACTION_START_OR_UPDATE = "com.mihrabnoor.app.action.START_OR_UPDATE";
    public static final String ACTION_TOGGLE = "com.mihrabnoor.app.action.TOGGLE";
    public static final String ACTION_NEXT = "com.mihrabnoor.app.action.NEXT";
    public static final String ACTION_PREV = "com.mihrabnoor.app.action.PREV";
    public static final String ACTION_STOP = "com.mihrabnoor.app.action.STOP";

    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_IS_PLAYING = "isPlaying";

    public interface ActionListener {
        void onMediaAction(String action);
    }

    private static volatile WeakReference<ActionListener> listenerRef = new WeakReference<>(null);

    public static void setActionListener(@Nullable ActionListener listener) {
        listenerRef = new WeakReference<>(listener);
    }

    private static void dispatchAction(String action) {
        ActionListener listener = listenerRef.get();
        if (listener != null) {
            listener.onMediaAction(action);
        }
    }

    @Nullable
    private MediaSession mediaSession;
    @Nullable
    private PowerManager.WakeLock wakeLock;

    private String currentTitle = "Mihrab Noor";
    private String currentBody = "Holy Quran Recitation";
    private boolean currentPlaying = false;

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel();
        initMediaSession();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;

        if (ACTION_STOP.equals(action)) {
            dispatchAction("stop");
            stopSelfForeground();
            return START_NOT_STICKY;
        }

        if (ACTION_TOGGLE.equals(action)) {
            currentPlaying = !currentPlaying;
            dispatchAction(currentPlaying ? "play" : "pause");
            updateSessionAndNotification();
            return START_STICKY;
        }

        if (ACTION_NEXT.equals(action)) {
            dispatchAction("next");
            updateSessionAndNotification();
            return START_STICKY;
        }

        if (ACTION_PREV.equals(action)) {
            dispatchAction("previous");
            updateSessionAndNotification();
            return START_STICKY;
        }

        if (intent != null) {
            String title = intent.getStringExtra(EXTRA_TITLE);
            String body = intent.getStringExtra(EXTRA_BODY);
            if (title != null && !title.isEmpty()) currentTitle = title;
            if (body != null && !body.isEmpty()) currentBody = body;
            currentPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, true);
        }

        if (currentPlaying) {
            acquireWakeLock();
        } else {
            releaseWakeLock();
        }

        updateSessionAndNotification();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        releaseWakeLock();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Quran Audio Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps Quran recitation active when minimized or locked");
            channel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @SuppressWarnings("deprecation")
    private void initMediaSession() {
        mediaSession = new MediaSession(this, "MihrabNoorMediaSession");
        mediaSession.setFlags(
            MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS
        );
        mediaSession.setCallback(
            new MediaSession.Callback() {
                @Override
                public void onPlay() {
                    currentPlaying = true;
                    acquireWakeLock();
                    dispatchAction("play");
                    updateSessionAndNotification();
                }

                @Override
                public void onPause() {
                    currentPlaying = false;
                    releaseWakeLock();
                    dispatchAction("pause");
                    updateSessionAndNotification();
                }

                @Override
                public void onSkipToNext() {
                    dispatchAction("next");
                }

                @Override
                public void onSkipToPrevious() {
                    dispatchAction("previous");
                }

                @Override
                public void onStop() {
                    dispatchAction("stop");
                    stopSelfForeground();
                }
            }
        );
        mediaSession.setActive(true);
    }

    private void updateSessionAndNotification() {
        if (mediaSession != null) {
            long actions =
                PlaybackState.ACTION_PLAY |
                PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_PLAY_PAUSE |
                PlaybackState.ACTION_SKIP_TO_NEXT |
                PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                PlaybackState.ACTION_STOP;
            int state = currentPlaying
                ? PlaybackState.STATE_PLAYING
                : PlaybackState.STATE_PAUSED;
            mediaSession.setPlaybackState(
                new PlaybackState.Builder()
                    .setActions(actions)
                    .setState(state, PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1.0f)
                    .build()
            );
            mediaSession.setMetadata(
                new MediaMetadata.Builder()
                    .putString(MediaMetadata.METADATA_KEY_TITLE, currentTitle)
                    .putString(MediaMetadata.METADATA_KEY_ARTIST, currentBody)
                    .putString(MediaMetadata.METADATA_KEY_ALBUM, "Mihrab Noor · مِحْرَاب النُّور")
                    .build()
            );
        }

        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            );
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private Notification buildNotification() {
        int immutableFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            ? PendingIntent.FLAG_IMMUTABLE
            : 0;
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | immutableFlag;

        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launchIntent == null) {
            launchIntent = new Intent(this, MainActivity.class);
        }
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 10, launchIntent, piFlags);

        PendingIntent prevIntent = serviceActionIntent(ACTION_PREV, 11, piFlags);
        PendingIntent toggleIntent = serviceActionIntent(ACTION_TOGGLE, 12, piFlags);
        PendingIntent nextIntent = serviceActionIntent(ACTION_NEXT, 13, piFlags);

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        builder
            .setSmallIcon(R.drawable.ic_stat_mihrab)
            .setContentTitle(currentTitle)
            .setContentText(currentBody)
            .setContentIntent(contentIntent)
            .setOngoing(currentPlaying)
            .setOnlyAlertOnce(true)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(
                new Notification.Action.Builder(
                    android.R.drawable.ic_media_previous,
                    "Previous",
                    prevIntent
                ).build()
            )
            .addAction(
                new Notification.Action.Builder(
                    currentPlaying
                        ? android.R.drawable.ic_media_pause
                        : android.R.drawable.ic_media_play,
                    currentPlaying ? "Pause" : "Play",
                    toggleIntent
                ).build()
            )
            .addAction(
                new Notification.Action.Builder(
                    android.R.drawable.ic_media_next,
                    "Next",
                    nextIntent
                ).build()
            );

        if (mediaSession != null) {
            builder.setStyle(
                new Notification.MediaStyle()
                    .setMediaSession(mediaSession.getSessionToken())
                    .setShowActionsInCompactView(0, 1, 2)
            );
        }

        return builder.build();
    }

    private PendingIntent serviceActionIntent(String action, int requestCode, int flags) {
        Intent intent = new Intent(this, MediaPlaybackService.class);
        intent.setAction(action);
        return PendingIntent.getService(this, requestCode, intent, flags);
    }

    private void stopSelfForeground() {
        releaseWakeLock();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            @SuppressWarnings("deprecation")
            boolean unused = true;
            stopForeground(true);
        }
        stopSelf();
    }

    private void acquireWakeLock() {
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    wakeLock = pm.newWakeLock(
                        PowerManager.PARTIAL_WAKE_LOCK,
                        "MihrabNoor::MediaPlaybackWakeLock"
                    );
                    wakeLock.setReferenceCounted(false);
                }
            }
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire(60 * 60 * 1000L);
            }
        } catch (Exception ignored) {
            // Ignore WakeLock errors
        }
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception ignored) {
            // Ignore WakeLock release errors
        }
    }
}
