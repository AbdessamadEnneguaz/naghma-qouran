package com.mihrabnoor.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MihrabMedia")
public class MihrabMediaPlugin extends Plugin implements MediaPlaybackService.ActionListener {

    @Override
    public void load() {
        super.load();
        MediaPlaybackService.setActionListener(this);
    }

    @Override
    protected void handleOnDestroy() {
        MediaPlaybackService.setActionListener(null);
        super.handleOnDestroy();
    }

    @PluginMethod
    public void startOrUpdate(PluginCall call) {
        String title = call.getString("title", "Mihrab Noor");
        String body = call.getString("body", "Holy Quran Recitation");
        boolean isPlaying = Boolean.TRUE.equals(call.getBoolean("isPlaying", true));

        Context context = getContext();
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_START_OR_UPDATE);
        intent.putExtra(MediaPlaybackService.EXTRA_TITLE, title);
        intent.putExtra(MediaPlaybackService.EXTRA_BODY, body);
        intent.putExtra(MediaPlaybackService.EXTRA_IS_PLAYING, isPlaying);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_STOP);
        context.stopService(intent);
        call.resolve();
    }

    @Override
    public void onMediaAction(String action) {
        JSObject data = new JSObject();
        data.put("action", action);
        notifyListeners("mediaAction", data);
    }
}
