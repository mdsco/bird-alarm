package com.birdalarm.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.modules.core.DeviceEventManagerModule

class AlarmReceiver : BroadcastReceiver() {

    companion object {
        const val EXTRA_HOUR = "alarm_hour"
        const val EXTRA_MINUTE = "alarm_minute"
        private const val CHANNEL_ID = "bird_alarm_channel"
        const val NOTIFICATION_ID = 1001
    }

    override fun onReceive(context: Context, intent: Intent) {
        val hour = intent.getIntExtra(EXTRA_HOUR, -1)
        val minute = intent.getIntExtra(EXTRA_MINUTE, -1)

        // Set the flag so JS detects the alarm on next mount / AppState→active
        context.getSharedPreferences("BirdAlarmPrefs", Context.MODE_PRIVATE)
            .edit().putBoolean("alarmFiredPending", true).apply()

        // If the React context is live (app foregrounded), emit an event for immediate navigation
        (context.applicationContext as? MainApplication)
            ?.reactHost
            ?.currentReactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("BirdAlarmFired", null)

        // Only post the alarm notification when our app is NOT in the foreground.
        // - App foreground: the BirdAlarmFired JS event above already navigates to
        //   the video player; a notification would just be redundant clutter.
        // - App not foreground: post the full-screen-intent notification. On a locked
        //   device the OS auto-launches MainActivity over the keyguard; with another
        //   app foregrounded the OS shows it as a heads-up the user taps to open.
        //   (The launcher/home-screen case is indistinguishable from "another app"
        //   without PACKAGE_USAGE_STATS, so it falls back to the heads-up.)
        if (!MainApplication.isAppForeground) {
            showAlarmNotification(context)
        }

        // Re-schedule for the same time tomorrow
        if (hour >= 0 && minute >= 0) {
            AlarmModule.scheduleAlarmAt(context, hour, minute, reschedule = true)
        }
    }

    private fun showAlarmNotification(context: Context) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Bird Alarm",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Daily bird alarm"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val launchIntent = context.packageManager
            .getLaunchIntentForPackage(context.packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP }

        val pendingIntent = PendingIntent.getActivity(
            context,
            AlarmModule.REQUEST_CODE,
            launchIntent ?: Intent(),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Bird Alarm")
            .setContentText("Your morning bird is ready!")
            .setFullScreenIntent(pendingIntent, /* highPriority= */ true)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
